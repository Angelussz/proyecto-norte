import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductDetail } from "@/features/product/types/product.interface";

const COLOR_HEX_FALLBACK = "#808080";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const product = await prisma.products.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        variants: true,
      },
    });

    if (!product || !product.active) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    const variantImages = product.variants
      .map((v) => v.image_url)
      .filter((url): url is string => !!url);

    // La imagen principal va primero, seguida de las imágenes de las variantes.
    const images = [product.image_url, ...variantImages]
      .filter((url): url is string => !!url)
      .filter((url, index, self) => self.indexOf(url) === index)
      .slice(0, 3);

    const colors = Array.from(
      new Set(
        product.variants
          .filter((variant) => variant.active)
          .map((variant) => variant.color.trim())
          .filter((color) => !!color),
      ),
    );

    // Conservamos el ID real de cada variante para el carrito y Stripe.
    const detail: ProductDetail = {
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: Number(product.base_price),
      category_name: product.category.name,
      colors: colors.map((name) => ({
        name,
        hex: COLOR_HEX_FALLBACK,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color.trim(),
        stock: variant.active ? variant.stock : 0,
        price: Number(variant.price),
      })),
      images,
    };

    // Sugerencias: misma categoría, excluyendo el producto actual.
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
    ).map((p) => ({
      ...p,
      base_price: Number(p.base_price),
    }));

    return NextResponse.json({ product: detail, suggestions });
  } catch (error) {
    console.error(
      "[GET /api/products/[id]] Base de datos no disponible:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ error: "No se pudo cargar el producto" }, { status: 500 });
  }
}
