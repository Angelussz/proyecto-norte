import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error(
      "[GET /api/categories] Base de datos no disponible:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "No se pudieron cargar las categorías" },
      { status: 500 },
    );
  }
}