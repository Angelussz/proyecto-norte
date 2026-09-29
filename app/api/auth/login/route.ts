import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCredentials, AuthError } from "@/features/auth/services/auth.service";
import { signToken, getSessionCookieOptions } from "@/lib/session";
import type { LoginBody, LoginResponse } from "@/features/auth/types/auth.interface";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/login
 *
 * Flujo completo en 5 pasos:
 *  1. Parsear y validar el body JSON
 *  2. Verificar credenciales (email + password) contra la DB
 *  3. Firmar un JWT con el payload del usuario
 *  4. Adjuntar el token en una cookie HTTP-only
 *  5. Devolver la información pública del usuario (sin datos sensibles)
 *
 * Errores manejados:
 *  - 400 Bad Request  → body mal formado o campos faltantes
 *  - 401 Unauthorized → credenciales inválidas
 *  - 500 Internal     → error inesperado del servidor
 */
export async function POST(req: NextRequest) {
  // ── 1. Parsear body ─────────────────────────────────────────────────────────
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Body inválido. Se esperaba JSON con email y password." },
      { status: 400 }
    );
  }

  const { email, password } = body;

  // ── Validación básica de campos requeridos ──────────────────────────────────
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return NextResponse.json(
      { error: "email y password son obligatorios." },
      { status: 400 }
    );
  }

  // ── 2 + 3. Verificar credenciales y firmar token ────────────────────────────
  try {
    const jwtPayload = await verifyCredentials(email, password);
    const token = await signToken(jwtPayload);

    // ── 5. Leer el nombre del usuario para la respuesta pública ────────────────
    const user = await prisma.users.findUnique({
      where: { id: jwtPayload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    const responseBody: LoginResponse = {
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
      },
    };

    // ── 4. Crear la respuesta con la cookie de sesión ──────────────────────────
    const res = NextResponse.json(responseBody, { status: 200 });
    const cookieOpts = getSessionCookieOptions();

    res.cookies.set({
      name: cookieOpts.name,
      value: token,
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    return res;
  } catch (error) {
    // Error controlado: credenciales inválidas → 401
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Error inesperado → 500 (nunca exponemos el error real al cliente)
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
