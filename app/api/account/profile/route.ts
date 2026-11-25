import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyToken,
  signToken,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/session";
import {
  getUserProfile,
  updateUserProfile,
  AccountError,
} from "@/features/auth/services/account.service";
import type { UpdateProfileBody } from "@/features/auth/types/auth.interface";

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(100),
    lastName: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres.").max(100),
    phone: z.string().trim().max(30).optional().default(""),
  })
  .strict();

/**
 * GET /api/account/profile
 * Devuelve el perfil completo del usuario autenticado directamente desde PostgreSQL.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const payload = await verifyToken(token);
    const user = await getUserProfile(payload.sub);

    return NextResponse.json({ user }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AccountError) {
      const statusMap = {
        VALIDATION: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        CONFLICT: 409,
      };
      return NextResponse.json(
        { error: error.message },
        { status: statusMap[error.code] || 500, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("[GET /api/account/profile]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

/**
 * PATCH /api/account/profile
 * Actualiza nombre, apellido y teléfono del usuario autenticado.
 * Actualiza también la cookie de sesión para reflejar el nuevo nombre sin forzar re-login.
 */
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const payload = await verifyToken(token);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Formato de cuerpo JSON inválido" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json(
        { error: firstError },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { user, updatedPayload } = await updateUserProfile(
      payload.sub,
      parseResult.data as UpdateProfileBody,
    );

    // Firmar nuevo JWT con el nombre actualizado y adjuntarlo en la cookie
    const newToken = await signToken(updatedPayload);
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json(
      { user },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );

    response.cookies.set({
      name: cookieOpts.name,
      value: newToken,
      maxAge: cookieOpts.maxAge,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
    });

    return response;
  } catch (error) {
    if (error instanceof AccountError) {
      const statusMap = {
        VALIDATION: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        CONFLICT: 409,
      };
      return NextResponse.json(
        { error: error.message },
        { status: statusMap[error.code] || 500, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("[PATCH /api/account/profile]", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el perfil" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
