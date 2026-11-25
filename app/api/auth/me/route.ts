import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserProfile, AccountError } from "@/features/auth/services/account.service";
import type { SessionUser } from "@/features/auth/types/auth.interface";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/auth/me
 *
 * El frontend llama a este endpoint (via React Query) para saber si el usuario
 * tiene sesión activa. Verifica la cookie HTTP-only y consulta la DB para
 * devolver los datos actualizados del perfil.
 *
 * Respuestas:
 *  200 { user: SessionUser }  → hay sesión válida
 *  200 { user: null }         → no hay sesión, el token expiró o el usuario no existe
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE });
  }

  try {
    const payload = await verifyToken(token);
    const user: SessionUser = await getUserProfile(payload.sub);

    return NextResponse.json({ user }, { status: 200, headers: NO_STORE });
  } catch (error) {
    // Token inválido/expirado o usuario inexistente → tratar como sin sesión;
    // cualquier fallo inesperado de DB también se registra para diagnóstico.
    if (!(error instanceof AccountError)) {
      console.warn("[GET /api/auth/me] Sesión no resuelta:", error);
    }
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE });
  }
}
