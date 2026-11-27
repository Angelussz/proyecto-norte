import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/session";
import { getClientIp } from "@/lib/rate-limit";
import {
  NO_STORE_HEADERS,
  requireAccountSession,
  handleAccountRouteError,
  setSessionCookie,
} from "@/lib/account-api";
import { uploadUserAvatar, deleteUserAvatar } from "@/features/auth/services/avatar.service";

/**
 * POST /api/account/avatar
 * Recibe multipart/form-data con campo `image` (o `file`), valida formato y tamaño,
 * sube a Cloudinary (si está configurado en `.env`) o a `public/uploads/avatars/`,
 * actualiza el usuario en PostgreSQL, renueva la cookie JWT y devuelve `{ user, storage }`.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json(
      { error: "El cuerpo debe ser multipart/form-data." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const file = form.get("image") ?? form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Debes adjuntar un archivo de imagen en el campo "image".' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const { user, updatedPayload, storage } = await uploadUserAvatar(auth.payload.sub, file, {
      jti: auth.payload.jti,
      ipAddress: getClientIp(req),
    });

    const newToken = await signToken(updatedPayload);
    const response = NextResponse.json(
      { user, storage },
      { status: 200, headers: NO_STORE_HEADERS },
    );
    setSessionCookie(response, newToken);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[POST /api/account/avatar]",
      "Error interno al guardar la fotografía",
    );
  }
}

/**
 * DELETE /api/account/avatar
 * Elimina la fotografía de perfil actual (Cloudinary o almacenamiento local),
 * limpia `picture_url` / `picture_id` en DB y actualiza la cookie JWT.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const { user, updatedPayload } = await deleteUserAvatar(auth.payload.sub, {
      jti: auth.payload.jti,
      ipAddress: getClientIp(req),
    });

    const newToken = await signToken(updatedPayload);
    const response = NextResponse.json({ user }, { status: 200, headers: NO_STORE_HEADERS });
    setSessionCookie(response, newToken);

    return response;
  } catch (error) {
    return handleAccountRouteError(
      error,
      "[DELETE /api/account/avatar]",
      "Error interno al eliminar la fotografía",
    );
  }
}
