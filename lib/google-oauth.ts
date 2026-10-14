/**
 * lib/google-oauth.ts
 *
 * Helpers para el flujo OAuth 2.0 de Google (Authorization Code Flow).
 *
 * ¿Cómo funciona OAuth 2.0?
 *  1. Redirigimos al usuario a Google con un "state" aleatorio (anti-CSRF).
 *  2. Google autentifica al usuario y lo redirige de vuelta a nuestro callback
 *     con un `code` de un solo uso.
 *  3. Intercambiamos ese `code` por un `access_token` usando nuestro secret.
 *  4. Usamos el `access_token` para obtener el perfil del usuario desde Google.
 *  5. Creamos o encontramos al usuario en nuestra DB y emitimos nuestro JWT.
 *
 * No usamos librerías externas (passport, next-auth) para entender el flujo
 * desde cero — solo fetch() nativo.
 */

import { env } from "@/lib/env";

// ─── URLs de Google ───────────────────────────────────────────────────────────
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// ─── Tipos de respuesta de Google ────────────────────────────────────────────

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  sub: string;        // ID único de Google
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// ─── 1. Construir la URL de autorización de Google ───────────────────────────
/**
 * Genera la URL a la que redirigimos al usuario para que Google lo autentifique.
 * El parámetro `state` es un token aleatorio que guardamos en una cookie
 * y verificamos en el callback para prevenir ataques CSRF.
 */
export function buildGoogleAuthUrl(state: string): string {
  const clientId = env.GOOGLE_CLIENT_ID;
  const redirectUri = env.GOOGLE_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",       // Authorization Code Flow
    scope: "openid email profile", // datos que pedimos al usuario
    state,                        // anti-CSRF
    access_type: "online",        // no necesitamos refresh token por ahora
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// ─── 2. Intercambiar el `code` por un `access_token` ─────────────────────────
/**
 * Google nos da un `code` de un solo uso. Lo intercambiamos por el token real.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<GoogleTokenResponse> {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URI;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return res.json() as Promise<GoogleTokenResponse>;
}

// ─── 3. Obtener el perfil del usuario desde Google ───────────────────────────
export async function getGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el perfil de Google");
  }

  return res.json() as Promise<GoogleUserInfo>;
}

// ─── Helper: generar un state aleatorio ──────────────────────────────────────
export function generateState(): string {
  return crypto.randomUUID(); // Web Crypto API, disponible en Node 19+ y Edge
}
