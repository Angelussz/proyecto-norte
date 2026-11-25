import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { clearSessionCookie, NO_STORE_HEADERS } from "@/lib/account-api";
import { getUserProfile, AccountError } from "@/features/auth/services/account.service";
import { isSessionActiveAndTouch } from "@/features/auth/services/security.service";
import type { SessionUser } from "@/features/auth/types/auth.interface";

/**
 * GET /api/auth/me
 *
 * El frontend llama a este endpoint (via React Query) para saber si el usuario
 * tiene sesión activa. Verifica la cookie HTTP-only, comprueba que la sesión
 * (`jti`) no haya sido revocada y consulta la DB para devolver los datos del perfil.
 *
 * Respuestas:
 *  200 { user: SessionUser }  → hay sesión válida
 *  200 { user: null }         → no hay sesión, el token expiró, fue revocado o el usuario no existe
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE_HEADERS });
  }

  try {
    const payload = await verifyToken(token);

    if (payload.jti) {
      const active = await isSessionActiveAndTouch(payload.sub, payload.jti);
      if (!active) {
        const res = NextResponse.json({ user: null }, { status: 200, headers: NO_STORE_HEADERS });
        clearSessionCookie(res);
        return res;
      }
    }

    const user: SessionUser = await getUserProfile(payload.sub);
    return NextResponse.json({ user }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    if (!(error instanceof AccountError)) {
      console.warn("[GET /api/auth/me] Sesión no resuelta:", error);
    }
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE_HEADERS });
  }
}
