import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
        image_url_id: true,
      },
    });

    const CATEGORY_ORDER = ["camisas", "pantalones", "accesorios", "calzados"];
    categories.sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.slug.toLowerCase());
      const idxB = CATEGORY_ORDER.indexOf(b.slug.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error(
      "[GET /api/categories] Base de datos no disponible:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ error: "No se pudieron cargar las categorías" }, { status: 500 });
  }
}
