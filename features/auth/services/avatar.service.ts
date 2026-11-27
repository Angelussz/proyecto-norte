import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  isCloudinaryConfigured,
  MediaError,
  uploadImage,
  validateImageBuffer,
  type AllowedImageMime,
} from "@/services/media.service";
import {
  cleanupStoredAvatar,
  LOCAL_AVATAR_DIR,
  LOCAL_AVATAR_URL_PREFIX,
} from "@/features/auth/lib/avatar-storage";
import { isDeletedEmail } from "@/features/auth/lib/deleted-account";
import { AccountError, mapUserRecordToProfile } from "@/features/auth/services/account.service";
import type { JwtPayload, UserProfile } from "@/features/auth/types/auth.interface";

const AVATAR_CLOUDINARY_FOLDER = "proyecto-norte/avatars";

const EXT_BY_MIME: Record<AllowedImageMime, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Sube una nueva fotografía de perfil para el usuario autenticado.
 * - Si Cloudinary está configurado en `.env`, sube a `proyecto-norte/avatars`.
 * - Si aún no está configurado, valida los magic bytes reales y guarda localmente
 *   en `public/uploads/avatars/` como fallback funcional en desarrollo.
 */
export async function uploadUserAvatar(
  userId: string,
  file: File,
  context?: { jti?: string; ipAddress?: string },
): Promise<{
  user: UserProfile;
  updatedPayload: JwtPayload;
  storage: "cloudinary" | "local";
}> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const existing = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      picture_url: true,
      picture_id: true,
    },
  });

  if (!existing || isDeletedEmail(existing.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  let validated: { buffer: Buffer; mime: AllowedImageMime };
  try {
    validated = await validateImageBuffer(file);
  } catch (err) {
    if (err instanceof MediaError) {
      throw new AccountError("VALIDATION", err.message);
    }
    throw err;
  }

  let nextUrl: string;
  let nextPublicId: string | null = null;
  let storage: "cloudinary" | "local";

  if (isCloudinaryConfigured()) {
    try {
      const stored = await uploadImage(file, AVATAR_CLOUDINARY_FOLDER);
      nextUrl = stored.secureUrl;
      nextPublicId = stored.publicId;
      storage = "cloudinary";
    } catch (err) {
      const msg =
        err instanceof MediaError ? err.message : "No se pudo subir la imagen a Cloudinary.";
      throw new AccountError("CONFLICT", msg);
    }
  } else {
    await fs.mkdir(LOCAL_AVATAR_DIR, { recursive: true });
    const filename = `${randomUUID()}${EXT_BY_MIME[validated.mime]}`;
    await fs.writeFile(path.join(LOCAL_AVATAR_DIR, filename), validated.buffer);
    nextUrl = `${LOCAL_AVATAR_URL_PREFIX}${filename}`;
    nextPublicId = null;
    storage = "local";
  }

  const [updated] = await prisma.$transaction([
    prisma.users.update({
      where: { id: userId },
      data: {
        picture_url: nextUrl,
        picture_id: nextPublicId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
        phone: true,
        picture_url: true,
        role: true,
        email_verified: true,
        password_hash: true,
        created_at: true,
      },
    }),
    prisma.accountActivityLog.create({
      data: {
        user_id: userId,
        event_type: "AVATAR_UPDATED",
        title: "Fotografía de perfil actualizada",
        metadata: storage === "cloudinary" ? "Cloudinary" : "Portal Web (local)",
        ip_address: context?.ipAddress ?? null,
      },
    }),
  ]);

  await cleanupStoredAvatar(existing.picture_url, existing.picture_id);

  const userProfile = mapUserRecordToProfile(updated);
  const updatedPayload: JwtPayload = {
    sub: updated.id,
    ...(context?.jti ? { jti: context.jti } : {}),
    email: updated.email,
    name: updated.name,
    picture: updated.picture_url ?? undefined,
    role: updated.role,
  };

  return {
    user: userProfile,
    updatedPayload,
    storage,
  };
}

/**
 * Elimina la fotografía de perfil actual del usuario (tanto en Cloudinary/disco como en DB).
 */
export async function deleteUserAvatar(
  userId: string,
  context?: { jti?: string; ipAddress?: string },
): Promise<{ user: UserProfile; updatedPayload: JwtPayload }> {
  if (!userId?.trim()) {
    throw new AccountError("UNAUTHORIZED", "Sesión inválida.");
  }

  const existing = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      picture_url: true,
      picture_id: true,
    },
  });

  if (!existing || isDeletedEmail(existing.email)) {
    throw new AccountError("NOT_FOUND", "Usuario no encontrado.");
  }

  const hadAvatar = Boolean(existing.picture_url || existing.picture_id);

  const [updated] = await prisma.$transaction([
    prisma.users.update({
      where: { id: userId },
      data: {
        picture_url: null,
        picture_id: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
        phone: true,
        picture_url: true,
        role: true,
        email_verified: true,
        password_hash: true,
        created_at: true,
      },
    }),
    ...(hadAvatar
      ? [
          prisma.accountActivityLog.create({
            data: {
              user_id: userId,
              event_type: "AVATAR_REMOVED",
              title: "Fotografía de perfil eliminada",
              metadata: "Portal Web",
              ip_address: context?.ipAddress ?? null,
            },
          }),
        ]
      : []),
  ]);

  await cleanupStoredAvatar(existing.picture_url, existing.picture_id);

  const userProfile = mapUserRecordToProfile(updated);
  const updatedPayload: JwtPayload = {
    sub: updated.id,
    ...(context?.jti ? { jti: context.jti } : {}),
    email: updated.email,
    name: updated.name,
    picture: undefined,
    role: updated.role,
  };

  return {
    user: userProfile,
    updatedPayload,
  };
}
