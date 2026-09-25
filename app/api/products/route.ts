import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  ProductCatalogResponse,
} from "@/features/product/types/product-catalog.interface";
import type { Prisma } from "@/generated/prisma/client";

/**
 * GET /api/products
 * Catálogo público de productos activos.
 * No requiere autenticación.
 *
 * Query params:
 *   category  - slug de la categoría (opcional)
 *   minPrice  - precio mínimo (opcional)
 *   maxPrice  - precio máximo (opcional)
 *   sortBy    - "price_asc" | "price_desc" | "name_asc" | "newest" (default: newest)
 *   page      - número de página, empieza en 1 (default: 1)
 *   limit     - productos por página (default: 12, máx: 48)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // ── Parámetros de la URL ──────────────────────────────────────────────
  const categorySlug = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? "12")));
  const skip = (page - 1) * limit;

  try {
    // ── Filtros de Prisma ─────────────────────────────────────────────────
    const isCategoryFilter =
      categorySlug &&
      categorySlug.toLowerCase() !== "todas" &&
      categorySlug.trim() !== "";

    const parsedMin = minPrice ? Number(minPrice) : null;
    const parsedMax = maxPrice ? Number(maxPrice) : null;

    const where: Prisma.ProductsWhereInput = {
      active: true,
      ...(isCategoryFilter && {
        category: {
          slug: {
            equals: categorySlug.toLowerCase(),
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
      }),
      ...((parsedMin !== null || parsedMax !== null) && {
        base_price: {
          ...(parsedMin !== null && !isNaN(parsedMin) && { gte: parsedMin }),
          ...(parsedMax !== null && !isNaN(parsedMax) && { lte: parsedMax }),
        },
      }),
    };

    // ── Ordenamiento ──────────────────────────────────────────────────────
    const orderByMap: Record<string, Prisma.ProductsOrderByWithRelationInput> = {
      price_asc: { base_price: "asc" },
      price_desc: { base_price: "desc" },
      name_asc: { name: "asc" },
      newest: { created_at: "desc" },
    };
    const orderBy = orderByMap[sortBy] ?? orderByMap.newest;

    // ── Consulta con Prisma ──────────────────────────────────────────────
    const [products, total, totalInDb] = await prisma.$transaction([
      prisma.products.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          base_price: true,
          image_url: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.products.count({ where }),
      prisma.products.count(),
    ]);

    // Si la tabla de productos en la base de datos está vacía (sin seeds),
    // devolvemos un catálogo vacío en lugar de datos mock.
    if (totalInDb === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Si la DB tiene productos, devolvemos el resultado de la consulta
    const data = products.map((p) => ({
      ...p,
      base_price: Number(p.base_price),
    }));

    const response: ProductCatalogResponse = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    // Si la conexión a la base de datos falla (por ejemplo si Docker aún no está corriendo)
    console.warn(
      "[GET /api/products] Base de datos no disponible:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
