import { NextRequest, NextResponse } from "next/server";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  handleAccountRouteError,
} from "@/lib/account-api";
import { getAccountSecurity } from "@/features/auth/services/security.service";

/**
 * GET /api/account/security
 * Devuelve las sesiones activas del usuario y su registro reciente de actividad.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const data = await getAccountSecurity(auth.payload.sub, auth.payload.jti);
    return NextResponse.json(data, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[GET /api/account/security]",
      "Error interno al consultar la seguridad de la cuenta",
    );
  }
}
