import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSizeGroupById,
  updateSizeGroup,
  deleteSizeGroup,
} from "@/features/admin/services/size-system.service";
import type { UpdateSizeGroupBody } from "@/features/admin/types/size-system.interface";

/**
 * GET    /api/admin/size-groups/[id]   → Obtiene un grupo por ID
 * PUT    /api/admin/size-groups/[id]   → Actualiza título, descripción y sistemas
 * DELETE /api/admin/size-groups/[id]   → Elimina el grupo y sus sistemas
 */

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const group = await getSizeGroupById(id);
    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ data: group }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/size-groups/[id]]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: UpdateSizeGroupBody;
  try {
    body = (await req.json()) as UpdateSizeGroupBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  try {
    const updated = await updateSizeGroup(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/size-groups/[id]]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = await deleteSizeGroup(id);
    if (!deleted) {
      return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "Grupo eliminado correctamente." }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/size-groups/[id]]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
