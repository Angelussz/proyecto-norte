import { NextResponse } from "next/server";
import {
  listAdminCategories,
  createAdminCategory,
} from "@/features/admin/services/admin-category.service";

export async function GET() {
  try {
    const data = await listAdminCategories();
    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error("[GET /api/admin/categories]", err);
    return NextResponse.json(
      {
        error: "Error al obtener categorías",
        ...(process.env.NODE_ENV !== "production"
          ? { details: err instanceof Error ? err.message : String(err) }
          : {}),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    const created = await createAdminCategory(body);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/categories]", err);
    // Slug duplicado → Prisma P2002
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre o slug" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 });
  }
}
