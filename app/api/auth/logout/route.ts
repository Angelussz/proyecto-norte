import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { clearSessionCookie, NO_STORE_HEADERS } from "@/lib/account-api";
import { revokeSessionById } from "@/features/auth/services/security.service";

/**
 * POST /api/auth/logout
 *
 * Cierra la sesión del usuario marcando la sesión como revocada en DB (si tiene `jti`)
 * y eliminando la cookie HTTP-only del navegador.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      const payload = await verifyToken(token);
      await revokeSessionById(payload.sub, payload.jti);
    } catch {
      // Si el token ya expiró o es inválido, igual limpiamos la cookie
    }
  }

  const res = NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
  clearSessionCookie(res);

  return res;
}
