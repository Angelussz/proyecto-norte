import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  deleteProductImage,
  ProductAdminError,
  replaceProductImage,
} from "@/services/product-admin.service";

/**
 * POST /api/admin/products/[id]/image
 * Sube (o reemplaza) la imagen principal de un producto.
 * Body: multipart/form-data con campo "image".
 * Header: x-admin-token.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    const form = await req.formData().catch(() => null);
    if (!form) {
      throw new ProductAdminError("VALIDATION", "Body debe ser multipart/form-data");
    }

    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new ProductAdminError(
        "MISSING_FILE",
        'Campo "image" (File) requerido en form-data',
      );
    }

    const image = await replaceProductImage(id, file);
    return NextResponse.json(image);
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id]/image]");
  }
}

/**
 * DELETE /api/admin/products/[id]/image
 * Elimina la imagen principal de Cloudinary y pone a null las columnas.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    const image = await deleteProductImage(id);
    return NextResponse.json(image);
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id]/image]");
  }
}
