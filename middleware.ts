/**
 * middleware.ts (raíz del proyecto)
 *
 * El Middleware de Next.js corre en el Edge Runtime ANTES de renderizar
 * cualquier página. Lo usamos como guardián de rutas protegidas.
 *
 * Lógica:
 *  - Si el usuario visita una ruta protegida (ej: /account, /orders)
 *    sin tener cookie de sesión válida → lo redirigimos a /login.
 *  - Si ya está logueado e intenta entrar a /login o /register
 *    → lo mandamos a la tienda (/).
 *
 * ⚠️ El Edge Runtime NO tiene APIs de Node.js, por eso usamos `jose`
 *    (que usa Web Crypto API) en vez de `jsonwebtoken`.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Rutas que REQUIEREN estar autenticado
const PROTECTED_ROUTES = ["/account", "/orders", "/checkout"];

// Rutas que solo se muestran a usuarios NO autenticados
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Intentamos verificar el token (puede fallar si expiró o fue manipulado)
  let isAuthenticated = false;
  if (sessionCookie) {
    try {
      await verifyToken(sessionCookie);
      isAuthenticated = true;
    } catch {
      // Token inválido o expirado → tratar como no autenticado
      isAuthenticated = false;
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Ruta protegida + no autenticado → redirigir a login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname); // para redirigir de vuelta después
    return NextResponse.redirect(loginUrl);
  }

  // Ya autenticado + intenta ir a login/register → ir a la tienda
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// El middleware solo corre en estas rutas (evita correr en _next, imágenes, etc.)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
