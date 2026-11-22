import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function detectMime(buf: Buffer, declaredType?: string): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  if (buf.length > 8 && buf.subarray(4, 8).toString("ascii") === "ftyp") return "video/mp4";
  if (buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3)
    return "video/webm";
  if (declaredType === "video/mp4" || declaredType === "video/webm") return declaredType;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    // Acepta campo 'image', 'video' o 'file'
    const file = form.get("image") || form.get("video") || form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo multimedia requerido" }, { status: 400 });
    }
    if (file.size === 0) return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });

    const isVideo = file.type.startsWith("video/");
    const maxAllowed = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxAllowed) {
      return NextResponse.json(
        { error: isVideo ? "El video supera los 50 MB" : "La imagen supera los 15 MB" },
        { status: 413 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = detectMime(buf, file.type);
    if (!mime || !ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "Formato no soportado (solo JPG, PNG, WebP, MP4, WebM)" },
        { status: 415 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}${EXT_MAP[mime]}`;
    await fs.writeFile(path.join(uploadDir, filename), buf);

    return NextResponse.json({
      url: `/uploads/products/${filename}`,
      publicId: filename,
      mediaType: isVideo ? "video" : "image",
    });
  } catch {
    return NextResponse.json({ error: "Error interno al subir archivo" }, { status: 500 });
  }
}
