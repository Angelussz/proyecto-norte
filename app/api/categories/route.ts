import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/features/category/types/category.interface";

const CATEGORIES_FALLBACK: Category[] = [
  {
    id: "cat-camisas",
    name: "Camisas",
    slug: "camisas",
    image_url: null,
    image_url_id: null,
  },
  {
    id: "cat-pantalones",
    name: "Pantalones",
    slug: "pantalones",
    image_url: null,
    image_url_id: null,
  },
];

export async function GET() {
  let data: Category[] = CATEGORIES_FALLBACK;

  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
        image_url_id: true,
      },
    });

    if (categories.length > 0) data = categories;

    return NextResponse.json({ data });
  } catch (error) {
    console.warn(
      "[GET /api/categories] Base de datos no disponible, usando fallback:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ data });
  }
}
