import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  parseAccountBody,
  handleAccountRouteError,
} from "@/lib/account-api";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/auth/services/account.service";

const updateNotificationsSchema = z
  .object({
    notif_orders: z.boolean(),
    notif_promotions: z.boolean(),
    notif_newsletter: z.boolean(),
    notif_restock: z.boolean(),
  })
  .strict();

/**
 * GET /api/account/notifications
 * Devuelve las preferencias de notificación del usuario autenticado.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const prefs = await getNotificationPreferences(auth.payload.sub);
    return NextResponse.json({ data: prefs }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleAccountRouteError(
      err,
      "[GET /api/account/notifications]",
      "Error al obtener preferencias de notificación.",
    );
  }
}

/**
 * PATCH /api/account/notifications
 * Actualiza las preferencias de notificación del usuario autenticado.
 * notif_security siempre permanece true (no editable por el usuario).
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const parsed = await parseAccountBody(req, updateNotificationsSchema);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  try {
    const updated = await updateNotificationPreferences(auth.payload.sub, parsed.data);
    return NextResponse.json({ data: updated }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleAccountRouteError(
      err,
      "[PATCH /api/account/notifications]",
      "Error al actualizar preferencias de notificación.",
    );
  }
}
