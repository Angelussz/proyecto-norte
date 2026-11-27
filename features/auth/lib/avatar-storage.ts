import path from "node:path";
import fs from "node:fs/promises";
import { deleteImage, isCloudinaryConfigured } from "@/services/media.service";

export const LOCAL_AVATAR_URL_PREFIX = "/uploads/avatars/";
export const LOCAL_AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

/**
 * Elimina de disco una imagen local de avatar o de Cloudinary un recurso anterior.
 * Se ejecuta como limpieza best-effort para no dejar archivos huérfanos tras
 * reemplazar el avatar, quitarlo o cerrar la cuenta.
 */
export async function cleanupStoredAvatar(
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
