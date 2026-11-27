import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  parseAccountBody,
  handleAccountRouteError,
  setSessionCookie,
} from "@/lib/account-api";
import { changeUserEmail } from "@/features/auth/services/account.service";
import { signToken } from "@/lib/session";
import { extractRequestContext } from "@/lib/request-context";
import type { ChangeEmailBody } from "@/features/auth/types/auth.interface";

const changeEmailSchema = z
  .object({
    newEmail: z
      .string()
      .trim()
      .min(1, "El nuevo correo electrónico es obligatorio.")
      .email("El nuevo correo electrónico no tiene un formato válido.")
      .max(254, "El correo electrónico es demasiado largo."),
    password: z.string().min(1, "Debes confirmar tu contraseña actual."),
  })
  .strict();

/**
 * PATCH /api/account/email
 * Verifica la contraseña actual, actualiza el correo en DB (si no está en uso),
 * registra EMAIL_CHANGED en el historial, revoca otras sesiones activas y
 * renueva la cookie JWT manteniendo el `jti` actual.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const parsed = await parseAccountBody(req, changeEmailSchema);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  try {
    const { ipAddress, deviceLabel } = extractRequestContext(req);
    const { user, updatedPayload, revokedOtherSessions } = await changeUserEmail(
      auth.payload.sub,
      parsed.data as ChangeEmailBody,
      {
        jti: auth.payload.jti,
        ipAddress,
        deviceLabel,
      },
    );

    const newToken = await signToken(updatedPayload);
    const response = NextResponse.json(
      { user, revokedOtherSessions },
      { status: 200, headers: NO_STORE_HEADERS },
    );
    setSessionCookie(response, newToken);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[PATCH /api/account/email]",
      "Error interno al actualizar el correo electrónico",
    );
  }
}
