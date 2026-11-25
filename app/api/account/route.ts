import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  parseAccountBody,
  handleAccountRouteError,
  clearSessionCookie,
} from "@/lib/account-api";
import { closeUserAccount } from "@/features/auth/services/account.service";

const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "La contraseña es obligatoria."),
    reason: z.string().trim().max(100).optional(),
    feedback: z.string().trim().max(1000).optional(),
  })
  .strict();

/**
 * DELETE /api/account
 *
 * Anonimiza la cuenta del usuario autenticado y cierra su sesión.
 *
 * Respuestas:
 *  200 { ok: true }           → cuenta anonimizada, sesión cerrada
 *  400 Bad Request            → body inválido
 *  401 Unauthorized           → sin sesión, JWT expirado o contraseña incorrecta
 *  403 Forbidden              → intento de eliminar una cuenta ADMIN
 *  404 Not Found              → usuario inexistente o ya cerrado
 *  500 Internal Server Error  → error inesperado
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const parsed = await parseAccountBody(req, deleteAccountSchema);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  try {
    await closeUserAccount(auth.payload.sub, parsed.data);

    const response = NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
    clearSessionCookie(response);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[DELETE /api/account]",
      "Error interno al procesar la solicitud",
    );
  }
}
