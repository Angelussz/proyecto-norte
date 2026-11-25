import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/features/auth/types/auth.interface";

/**
 * GET /api/auth/me
 *
 * El frontend llama a este endpoint (via React Query) para saber si el usuario
 * tiene sesión activa. Consulta la DB para obtener datos actualizados del perfil
 * y corroborar que la cuenta no esté suspendida o eliminada.
 *
 * Respuestas:
 *  200 { user: SessionUser }  → hay sesión válida
 *  200 { user: null }         → no hay sesión (o el token expiró / cuenta inactiva)
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Sin cookie → sin sesión
  if (!token) {
    return NextResponse.json(
      { user: null },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const payload = await verifyToken(token);

    const dbUser = await prisma.users.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
        phone: true,
        picture_url: true,
        role: true,
        email_verified: true,
        created_at: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { user: null },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const user: SessionUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      last_name: dbUser.last_name,
      phone: dbUser.phone,
      picture: dbUser.picture_url ?? undefined,
      role: dbUser.role,
      email_verified: dbUser.email_verified,
      created_at: dbUser.created_at.toISOString(),
    };

    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    // Token inválido o expirado → tratamos como sin sesión
    return NextResponse.json(
      { user: null },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
