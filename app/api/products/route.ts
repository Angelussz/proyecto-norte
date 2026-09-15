import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductCatalogResponse } from "@/features/product/types/product-catalog.interface";
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
  try {
    const { searchParams } = req.nextUrl;

    // ── Parámetros de la URL ──────────────────────────────────────────────
    const categorySlug = searchParams.get("category") ?? undefined;
    const minPrice     = searchParams.get("minPrice");
    const maxPrice     = searchParams.get("maxPrice");
    const sortBy       = searchParams.get("sortBy") ?? "newest";
    const page         = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit        = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? "12")));
    const skip         = (page - 1) * limit;

    // ── Filtros de Prisma ─────────────────────────────────────────────────
    const where: Prisma.ProductsWhereInput = {
      active: true,
      ...(categorySlug && {
        category: { slug: categorySlug },
      }),
      ...((minPrice || maxPrice) && {
        base_price: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    };

    // ── Ordenamiento ──────────────────────────────────────────────────────
    const orderByMap: Record<string, Prisma.ProductsOrderByWithRelationInput> = {
      price_asc:  { base_price: "asc" },
      price_desc: { base_price: "desc" },
      name_asc:   { name: "asc" },
      newest:     { created_at: "desc" },
    };
    const orderBy = orderByMap[sortBy] ?? orderByMap.newest;

    // ── Consulta ──────────────────────────────────────────────────────────
    const [products, total] = await prisma.$transaction([
      prisma.products.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:         true,
          name:       true,
          slug:       true,
          base_price: true,
          image_url:  true,
          category: {
            select: {
              id:   true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    // ── Serializar Decimal → number ───────────────────────────────────────
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
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
