import { NextResponse } from "next/server";
import { getColorById, updateColor, deleteColor } from "@/features/admin/services/color.service";
import type { UpdateColorBody } from "@/features/admin/types/brand-color.interface";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const color = await getColorById(id);
    if (!color) return NextResponse.json({ error: "Color no encontrado." }, { status: 404 });
    return NextResponse.json({ data: color });
  } catch (error) {
    console.error("[GET /api/admin/colors/:id]", error);
    return NextResponse.json({ error: "Error al obtener el color." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body: UpdateColorBody = await req.json();
    const color = await updateColor(id, body);
    return NextResponse.json({ data: color });
  } catch (error) {
    console.error("[PUT /api/admin/colors/:id]", error);
    return NextResponse.json({ error: "Error al actualizar el color." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteColor(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al eliminar el color.";
    console.error("[DELETE /api/admin/colors/:id]", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
