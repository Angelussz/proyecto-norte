import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCredentials, AuthError } from "@/features/auth/services/auth.service";
import { signToken, getSessionCookieOptions } from "@/lib/session";
import type { LoginBody, LoginResponse } from "@/features/auth/types/auth.interface";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/login
 *
 * Flujo completo:
 *  1. Rate limit por IP (máx 10 intentos / 15 min)
 *  2. Parsear y validar el body JSON
 *  3. Verificar credenciales (email + password) contra la DB
 *  4. Firmar un JWT con el payload del usuario
 *  5. Adjuntar el token en una cookie HTTP-only
 *  6. Devolver la información pública del usuario (sin datos sensibles)
 *
 * Errores manejados:
 *  - 400 Bad Request   → body mal formado o campos faltantes
 *  - 401 Unauthorized  → credenciales inválidas
 *  - 429 Too Many Req  → demasiados intentos fallidos
 *  - 500 Internal      → error inesperado del servidor
 */
export async function POST(req: NextRequest) {
  // ── 1. Rate limiting por IP ───────────────────────────────────────────
  // Máx 10 intentos por IP en ventanas de 15 minutos.
  // La clave incluye el prefijo 'login:' para no colisionar con otros limiters.
  const ip = getClientIp(req);
  const limit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);

  if (!limit.allowed) {
    const retryAfterSec = Math.ceil(limit.retryAfterMs / 1000);
    return NextResponse.json(
      { error: `Demasiados intentos. Intentá en ${Math.ceil(retryAfterSec / 60)} minutos.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── 2. Parsear body ────────────────────────────────────────────────────────────────
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

  // ── 3 + 4. Verificar credenciales y firmar token ────────────────────────────
  try {
    const jwtPayload = await verifyCredentials(email, password);
    const token = await signToken(jwtPayload);

    // ── 6. Construir respuesta pública (todos los datos vienen del payload) ────
    // verifyCredentials ya selecciona name/email/role → no necesitamos una
    // segunda query a la DB.
    const responseBody: LoginResponse = {
      user: {
        id: jwtPayload.sub,
        email: jwtPayload.email,
        name: jwtPayload.name,
        role: jwtPayload.role,
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
