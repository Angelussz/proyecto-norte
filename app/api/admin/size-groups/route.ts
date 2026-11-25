import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllSizeGroups, createSizeGroup } from "@/features/admin/services/size-system.service";
import type { CreateSizeGroupBody } from "@/features/admin/types/size-system.interface";

/**
 * GET  /api/admin/size-groups   → Lista todos los grupos con sus sistemas
 * POST /api/admin/size-groups   → Crea un nuevo grupo con sus sistemas
 */

export async function GET() {
  try {
    const groups = await getAllSizeGroups();
    return NextResponse.json({ data: groups }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/size-groups]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: CreateSizeGroupBody;
  try {
    body = (await req.json()) as CreateSizeGroupBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
    return NextResponse.json(
      { error: "El título del grupo debe tener al menos 2 caracteres." },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.systems) || body.systems.length === 0) {
    return NextResponse.json(
      { error: "El grupo debe tener al menos un sistema de talles." },
      { status: 400 },
    );
  }

  try {
    const group = await createSizeGroup(body);
    return NextResponse.json({ data: group }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/size-groups]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
