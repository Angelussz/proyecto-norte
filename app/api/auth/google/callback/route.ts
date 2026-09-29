import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangeCodeForToken, getGoogleUserInfo } from "@/lib/google-oauth";
import { signToken, getSessionCookieOptions } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const STATE_COOKIE = "google_oauth_state";

/**
 * GET /api/auth/google/callback
 *
 * Paso 2 y 3 del flujo OAuth (Google nos redirige aquí):
 *
 *  1. Verificar el `state` anti-CSRF.
 *  2. Intercambiar el `code` por un access_token de Google.
 *  3. Obtener el perfil del usuario desde Google.
 *  4. Buscar o crear al usuario en nuestra DB (upsert por email).
 *  5. Crear nuestro JWT de sesión y guardarlo en una cookie HTTP-only.
 *  6. Redirigir a la tienda.
 */
export async function GET(req: NextRequest) {
  const appUrl = new URL("/", req.url).toString();
  const loginUrl = new URL("/login", req.url).toString();

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateFromGoogle = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // El usuario canceló el login en la pantalla de Google
    if (errorParam) {
      return NextResponse.redirect(loginUrl);
    }

    if (!code || !stateFromGoogle) {
      return NextResponse.redirect(loginUrl);
    }

    // ── 1. Verificar state anti-CSRF ──────────────────────────────────────────
    const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
    if (!stateCookie || stateCookie !== stateFromGoogle) {
      console.error("[Google OAuth] State mismatch — posible ataque CSRF");
      return NextResponse.redirect(loginUrl);
    }

    // ── 2. Intercambiar code por access_token ─────────────────────────────────
    const tokens = await exchangeCodeForToken(code);

    // ── 3. Obtener perfil del usuario desde Google ────────────────────────────
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email_verified) {
      console.error("[Google OAuth] Email no verificado:", googleUser.email);
      return NextResponse.redirect(loginUrl);
    }

    // ── 4. Buscar o crear usuario en la DB ────────────────────────────────────
    /**
     * Usamos upsert por email para dos casos:
     *  a) El usuario ya existe (registro clásico) → lo enlazamos con Google.
     *  b) Es nuevo → lo creamos con un password_hash vacío (no puede hacer
     *     login con contraseña, solo con Google).
     *
     * En producción real se agregaría un campo `google_id` para ser más precisos.
     */
    const user = await prisma.users.upsert({
      where: { email: googleUser.email },
      update: {
        // Si el usuario ya existía, no pisamos su contraseña ni su rol
      },
      create: {
        email: googleUser.email,
        name: googleUser.given_name,
        last_name: googleUser.family_name ?? "",
        phone: "",
        password_hash: "", // usuario Google: no puede hacer login con contraseña
        role: "CUSTOMER",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // ── 5. Crear JWT de sesión ────────────────────────────────────────────────
    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: googleUser.picture,  // avatar de Google → se muestra en el header
      role: user.role,
    });

    // ── 6. Redirigir a la tienda con la cookie de sesión ─────────────────────
    const res = NextResponse.redirect(appUrl);
    const cookieOpts = getSessionCookieOptions();

    // Borrar la cookie de state (ya no la necesitamos)
    res.cookies.set({ name: STATE_COOKIE, value: "", maxAge: 0, path: "/" });

    // Guardar el JWT de sesión
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
    console.error("[Google OAuth callback]", error);
    return NextResponse.redirect(loginUrl);
  }
}
