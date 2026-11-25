import { NextResponse } from "next/server";
import {
  updateAdminCategory,
  deleteAdminCategory,
} from "@/features/admin/services/admin-category.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateAdminCategory(id, body);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    console.error("[PUT /api/admin/categories/[id]]", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteAdminCategory(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/admin/categories/[id]]", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    // P2003 → tiene productos asociados
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return NextResponse.json(
        { error: "No se puede eliminar: la categoría tiene productos asociados" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Error al eliminar la categoría" }, { status: 500 });
  }
}
