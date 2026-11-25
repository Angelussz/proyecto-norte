import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  handleAccountRouteError,
} from "@/lib/account-api";
import { revokeRemoteSession } from "@/features/auth/services/security.service";

/**
 * DELETE /api/account/sessions/[id]
 * Revoca una sesión remota puntual del usuario autenticado.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { id } = await params;
    const { revokedId } = await revokeRemoteSession(
      auth.payload.sub,
      id,
      auth.payload.jti,
      getClientIp(req),
    );
    return NextResponse.json({ ok: true, revokedId }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[DELETE /api/account/sessions/[id]]",
      "Error interno al cerrar la sesión",
    );
  }
}
