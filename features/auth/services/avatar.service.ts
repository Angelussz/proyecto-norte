import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  deleteImage,
  isCloudinaryConfigured,
  MediaError,
  uploadImage,
  validateImageBuffer,
  type AllowedImageMime,
} from "@/services/media.service";
import { AccountError } from "@/features/auth/services/account.service";
import type { JwtPayload, UserProfile } from "@/features/auth/types/auth.interface";

const AVATAR_CLOUDINARY_FOLDER = "proyecto-norte/avatars";
const LOCAL_AVATAR_URL_PREFIX = "/uploads/avatars/";
const LOCAL_AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const DELETED_EMAIL_SUFFIX = "@norte.invalid";

const EXT_BY_MIME: Record<AllowedImageMime, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function toUserProfile(user: {
  id: string;
  email: string;
  name: string;
  last_name: string;
  phone: string;
  picture_url: string | null;
  role: "ADMIN" | "CUSTOMER";
  email_verified: boolean;
  created_at: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    last_name: user.last_name,
    phone: user.phone,
    picture: user.picture_url ?? undefined,
    role: user.role,
    email_verified: user.email_verified,
    created_at: user.created_at.toISOString(),
  };
}

/**
 * Elimina de disco una imagen local de avatar o de Cloudinary un recurso anterior.
 * Se ejecuta como limpieza best-effort para no dejar archivos huérfanos.
 */
async function cleanupPreviousAvatar(
  pictureUrl: string | null,
  pictureId: string | null,
): Promise<void> {
  if (pictureId && isCloudinaryConfigured()) {
    await deleteImage(pictureId).catch((err) => {
      console.warn("[avatar:cleanup] No se pudo eliminar avatar anterior en Cloudinary:", err);
    });
  }

  if (pictureUrl && pictureUrl.startsWith(LOCAL_AVATAR_URL_PREFIX)) {
    const filename = path.basename(pictureUrl);
    if (filename && filename !== ".gitkeep") {
      await fs.unlink(path.join(LOCAL_AVATAR_DIR, filename)).catch(() => {
        // El archivo ya no existía en disco
      });
    }
  }
}

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

  if (!existing || existing.email.endsWith(DELETED_EMAIL_SUFFIX)) {
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

  await cleanupPreviousAvatar(existing.picture_url, existing.picture_id);

  const userProfile = toUserProfile(updated);
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

  if (!existing || existing.email.endsWith(DELETED_EMAIL_SUFFIX)) {
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

  await cleanupPreviousAvatar(existing.picture_url, existing.picture_id);

  const userProfile = toUserProfile(updated);
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
