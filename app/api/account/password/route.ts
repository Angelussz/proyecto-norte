import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  parseAccountBody,
  handleAccountRouteError,
  setSessionCookie,
} from "@/lib/account-api";
import { changeUserPassword } from "@/features/auth/services/account.service";
import { signToken } from "@/lib/session";
import { extractRequestContext } from "@/lib/request-context";
import type { ChangePasswordBody } from "@/features/auth/types/auth.interface";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida."),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .max(128, "La nueva contraseña no puede superar los 128 caracteres."),
  })
  .strict();

/**
 * PATCH /api/account/password
 * Valida la contraseña actual del usuario autenticado, actualiza el hash en DB,
 * registra PASSWORD_CHANGED en el historial, revoca otras sesiones activas y
 * renueva la cookie de sesión actual preservando el `jti`.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const parsed = await parseAccountBody(req, changePasswordSchema);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  try {
    const { ipAddress, deviceLabel } = extractRequestContext(req);
    const { updatedPayload, revokedOtherSessions } = await changeUserPassword(
      auth.payload.sub,
      parsed.data as ChangePasswordBody,
      {
        jti: auth.payload.jti,
        ipAddress,
        deviceLabel,
      },
    );

    const newToken = await signToken(updatedPayload);
    const response = NextResponse.json(
      { ok: true as const, revokedOtherSessions },
      { status: 200, headers: NO_STORE_HEADERS },
    );
    setSessionCookie(response, newToken);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[PATCH /api/account/password]",
      "Error interno al cambiar la contraseña",
    );
  }
}
