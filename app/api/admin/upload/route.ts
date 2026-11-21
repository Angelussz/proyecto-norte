import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function detectMime(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Campo 'image' requerido" }, { status: 400 });
    }
    if (file.size === 0) return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "Imagen supera 12 MB" }, { status: 413 });

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = detectMime(buf);
    if (!mime || !ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "Formato no soportado (solo JPG, PNG, WebP)" },
        { status: 415 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}${EXT_MAP[mime]}`;
    await fs.writeFile(path.join(uploadDir, filename), buf);

    return NextResponse.json({ url: `/uploads/products/${filename}`, publicId: filename });
  } catch {
    return NextResponse.json({ error: "Error interno al subir imagen" }, { status: 500 });
  }
}
