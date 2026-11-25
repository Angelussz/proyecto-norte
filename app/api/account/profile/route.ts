import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signToken } from "@/lib/session";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  parseAccountBody,
  handleAccountRouteError,
  setSessionCookie,
} from "@/lib/account-api";
import { getUserProfile, updateUserProfile } from "@/features/auth/services/account.service";
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
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const user = await getUserProfile(auth.payload.sub);
    return NextResponse.json({ user }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[GET /api/account/profile]",
      "Error interno del servidor",
    );
  }
}

/**
 * PATCH /api/account/profile
 * Actualiza nombre, apellido y teléfono del usuario autenticado.
 * Actualiza también la cookie de sesión para reflejar el nuevo nombre sin forzar re-login.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const parsed = await parseAccountBody(req, updateProfileSchema);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  try {
    const { user, updatedPayload } = await updateUserProfile(
      auth.payload.sub,
      parsed.data as UpdateProfileBody,
    );

    const newToken = await signToken(updatedPayload);
    const response = NextResponse.json({ user }, { status: 200, headers: NO_STORE_HEADERS });
    setSessionCookie(response, newToken);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[PATCH /api/account/profile]",
      "Error interno al actualizar el perfil",
    );
  }
}
