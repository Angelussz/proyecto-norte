import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { toggleSizeSystem } from "@/features/admin/services/size-system.service";
import type { ToggleSizeSystemBody } from "@/features/admin/types/size-system.interface";

/**
 * PATCH /api/admin/size-groups/[id]/systems/[systemId]
 *
 * Activa o desactiva un sistema de talles individual (el checkbox de la vista).
 * Body: { active: boolean }
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; systemId: string }> },
) {
  const { systemId } = await params;

  let body: ToggleSizeSystemBody;
  try {
    body = (await req.json()) as ToggleSizeSystemBody;
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "El campo 'active' debe ser un booleano." }, { status: 400 });
  }

  try {
    const result = await toggleSizeSystem(systemId, body.active);
    if (!result) {
      return NextResponse.json({ error: "Sistema no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/admin/size-groups/[id]/systems/[systemId]]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
