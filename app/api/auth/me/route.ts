import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import type { SessionUser } from "@/features/auth/types/auth.interface";

/**
 * GET /api/auth/me
 *
 * El frontend llama a este endpoint (via React Query) para saber si el usuario
 * tiene sesión activa. Como la cookie es HTTP-only, el JS del browser no puede
 * leerla directamente; este endpoint hace el puente seguro.
 *
 * Respuestas:
 *  200 { user: SessionUser }  → hay sesión válida
 *  200 { user: null }         → no hay sesión (o el token expiró)
 *
 * ¿Por qué 200 en ambos casos?
 *   "No autenticado" no es un error de la aplicación; es un estado normal.
 *   Devolver 401 haría que React Query lo tratara como error y reintentara.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Sin cookie → sin sesión
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const payload = await verifyToken(token);

    const user: SessionUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: payload.role,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    // Token inválido o expirado → tratamos como sin sesión
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
