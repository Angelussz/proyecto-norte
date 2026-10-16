import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, generateState } from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";

/**
 * GET /api/auth/google
 *
 * Paso 1 del flujo OAuth:
 *  - Generamos un `state` aleatorio (UUID) y lo guardamos en una cookie.
 *  - Redirigimos al usuario a la pantalla de login de Google.
 *
 * ¿Por qué el state?
 *  Cuando Google nos devuelve el callback, comparamos el `state` de la URL
 *  con el que guardamos en la cookie. Si no coinciden, alguien intentó
 *  forzar nuestro callback con un code ajeno (ataque CSRF).
 */
export async function GET() {
  const state = generateState();
  const googleUrl = buildGoogleAuthUrl(state);

  const res = NextResponse.redirect(googleUrl);

  // Guardamos el state en una cookie HTTP-only de corta duración (10 min)
  res.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos
    path: "/",
  });

  return res;
}
