import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createUser, AuthError } from "@/features/auth/services/auth.service";
import { startAuthenticatedSession } from "@/features/auth/services/security.service";
import { signToken } from "@/lib/session";
import { setSessionCookie } from "@/lib/account-api";
import { extractRequestContext } from "@/lib/request-context";
import type { RegisterBody, RegisterResponse } from "@/features/auth/types/auth.interface";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/register
 *
 * Flujo:
 *  1. Rate limit por IP (máx 5 registros / hora) — para evitar spam de cuentas
 *  2. Parsear y validar el body JSON
 *  3. Validaciones básicas de los campos (formato, longitud mínima, etc.)
 *  4. Crear el usuario en la DB con la contraseña hasheada (bcrypt, 10 rondas)
 *  5. Firmar un JWT con el payload del nuevo usuario
 *  6. Adjuntar el token en una cookie HTTP-only (inicio de sesión automático)
 *  7. Devolver la información pública del usuario
 *
 * Errores manejados:
 *  - 400 Bad Request   → body mal formado, campos faltantes o inválidos
 *  - 409 Conflict      → el correo ya está registrado
 *  - 429 Too Many Req  → demasiados registros desde la misma IP
 *  - 500 Internal      → error inesperado del servidor
 */
export async function POST(req: NextRequest) {
  // ── 1. Rate limiting por IP ──────────────────────────────────────────────────
  // Máx 5 cuentas nuevas por IP en 1 hora.
  const ip = getClientIp(req);
  const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);

  if (!limit.allowed) {
    const retryAfterSec = Math.ceil(limit.retryAfterMs / 1000);
    return NextResponse.json(
      { error: `Demasiados intentos. Intentá en ${Math.ceil(retryAfterSec / 60)} minutos.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // ── 2. Parsear body ──────────────────────────────────────────────────────────
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { error: "Body inválido. Se esperaba JSON con name, lastName, email y password." },
      { status: 400 },
    );
  }

  const { name, lastName, email, password } = body;

  // ── 3. Validaciones de campos ────────────────────────────────────────────────
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "El nombre debe tener al menos 2 caracteres." },
      { status: 400 },
    );
  }
  if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
    return NextResponse.json(
      { error: "El apellido debe tener al menos 2 caracteres." },
      { status: 400 },
    );
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "El correo electrónico es obligatorio." }, { status: 400 });
  }
  // Validación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: "El correo electrónico no tiene un formato válido." },
      { status: 400 },
    );
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  // ── 4 + 5. Crear usuario y firmar token ──────────────────────────────────────
  try {
    const jwtPayload = await createUser(name, lastName, email, password);
    const reqCtx = extractRequestContext(req);
    const sessionId = await startAuthenticatedSession(jwtPayload.sub, reqCtx, {
      eventType: "REGISTER",
      title: "Cuenta creada e inicio de sesión",
    });
    const token = await signToken({ ...jwtPayload, jti: sessionId });

    // ── 6. Respuesta pública ───────────────────────────────────────────────────
    const responseBody: RegisterResponse = {
      user: {
        id: jwtPayload.sub,
        email: jwtPayload.email,
        name: jwtPayload.name,
        role: jwtPayload.role,
      },
    };

    // ── 7. Cookie de sesión (login automático tras el registro) ───────────────
    const res = NextResponse.json(responseBody, { status: 201 });
    setSessionCookie(res, token);

    return res;
  } catch (error) {
    // Email ya registrado → 409 Conflict
    if (error instanceof AuthError && error.code === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Error inesperado → 500
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
