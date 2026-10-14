/**
 * lib/session.ts
 *
 * Utilidades de sesión basadas en JWT + cookies HTTP-only.
 *
 * ¿Por qué JWT?
 *   - El servidor no necesita persistir sesiones en Redis o en la DB.
 *   - El token viaja en una cookie HTTP-only → el JS del browser nunca lo ve
 *     → inmune a ataques XSS.
 *
 * ¿Por qué jose y no jsonwebtoken?
 *   - `jsonwebtoken` usa APIs de Node.js que no están disponibles en el
 *     Edge Runtime de Next.js (middleware). `jose` es 100 % Web Crypto API
 *     y funciona tanto en Node como en Edge.
 */

import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@/features/auth/types/auth.interface";

const SESSION_COOKIE = "norte_session";
const ONE_DAY_S = 60 * 60 * 24; // 24 h en segundos (para max-age de la cookie)
const EXPIRY = "7d";             // el token expira en 7 días

// ─── Clave secreta ────────────────────────────────────────────────────────────
// TextEncoder convierte el string del .env en un Uint8Array
// que jose espera para HMAC-SHA256.
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing environment variable: JWT_SECRET");
  return new TextEncoder().encode(secret);
}

// ─── Firmar un token ──────────────────────────────────────────────────────────
export async function signToken(payload: JwtPayload): Promise<string> {
  // jose requiere un objeto indexable por string → doble cast necesario
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })  // algoritmo HMAC-SHA256
    .setIssuedAt()                          // campo `iat` = ahora
    .setExpirationTime(EXPIRY)             // campo `exp` = ahora + 7 días
    .sign(getSecretKey());
}

// ─── Verificar y decodificar un token ────────────────────────────────────────
// Devuelve el payload si el token es válido y no ha expirado.
// Lanza si el token es inválido, expirado o fue manipulado.
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as unknown as JwtPayload;
}

// ─── Nombre de la cookie ─────────────────────────────────────────────────────
// Lo exportamos para que el middleware y el endpoint de logout puedan usarlo.
export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// ─── Opciones de la cookie (reutilizables) ───────────────────────────────────
export function getSessionCookieOptions(maxAgeSeconds = ONE_DAY_S * 7) {
  return {
    name: SESSION_COOKIE,
    maxAge: maxAgeSeconds,
    httpOnly: true,          // ← el JS del browser NO puede leer esta cookie
    secure: process.env.NODE_ENV === "production", // HTTPS solo en prod
    sameSite: "lax" as const, // protección básica contra CSRF
    path: "/",
  };
}
