import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  handleAccountRouteError,
} from "@/lib/account-api";
import { revokeAllOtherSessions } from "@/features/auth/services/security.service";

/**
 * DELETE /api/account/sessions
 * Cierra todas las sesiones activas del usuario excepto la sesión actual (`jti`).
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { revokedCount } = await revokeAllOtherSessions(
      auth.payload.sub,
      auth.payload.jti,
      getClientIp(req),
    );
    return NextResponse.json(
      { ok: true, revokedCount },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[DELETE /api/account/sessions]",
      "Error interno al cerrar las demás sesiones",
    );
  }
}
