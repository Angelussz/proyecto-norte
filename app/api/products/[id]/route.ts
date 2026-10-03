import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductDetail } from "@/features/product/types/product.interface";

const COLOR_HEX_FALLBACK = "#808080";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await prisma.products.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            name: true
          }
        },
        variants: true,
      },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 },
      );
    }

    const variantImages = product.variants
      .map((v) => v.image_url)
      .filter((url): url is string => !!url);


    // Galería plana: la principal va primera y también cuenta como thumbnail.
    const images = [product.image_url, ...variantImages]
      .filter((url): url is string => !!url)
      .filter((url, index, self) => self.indexOf(url) === index)
      .slice(0, 3);

    const stockBySize = new Map<string, number>();
    for (const v of product.variants) {
      stockBySize.set(v.size, (stockBySize.get(v.size) ?? 0) + v.stock);
    }

    const colors = Array.from(
      new Set(
        product.variants
          .map((v) => v.color?.trim())
          .filter((c): c is string => !!c),
      ),
    );

    const detail: ProductDetail = {
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: Number(product.base_price),
      category_name: product.category.name,
      colors: colors.map((name) => ({ name, hex: COLOR_HEX_FALLBACK })),
      variants: Array.from(stockBySize, ([size, stock]) => ({ size, stock })),
      images,
    };

    // ── Sugerencias: misma categoría, excluyendo el actual ──────────────
    const suggestions = (
      await prisma.products.findMany({
        where: {
          category_id: product.category_id,
          id: { not: product.id },
          active: true,
        },
        take: 4,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          base_price: true,
          image_url: true,
        },
      })
    ).map((p) => ({ ...p, base_price: Number(p.base_price) }));

    return NextResponse.json({ product: detail, suggestions });
  } catch (error) {
    console.error(
      "[GET /api/products/[id]] Base de datos no disponible:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "No se pudo cargar el producto" },
      { status: 500 },
    );
  }
}
