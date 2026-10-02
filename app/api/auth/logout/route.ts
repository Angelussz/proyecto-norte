import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * POST /api/auth/logout
 *
 * Cierra la sesión del usuario eliminando la cookie HTTP-only.
 * Al borrar la cookie, el JWT deja de enviarse → el middleware rechazará
 * cualquier ruta protegida.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });

  // Sobreescribir la cookie con maxAge = 0 la elimina del browser
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}
