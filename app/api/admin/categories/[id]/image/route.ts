import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  CategoryAdminError,
  deleteCategoryImage,
  replaceCategoryImage,
} from "@/services/category-admin.service";

/**
 * POST /api/admin/categories/[id]/image
 * Sube (o reemplaza) la imagen principal de una categoría.
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
      throw new CategoryAdminError(
        "VALIDATION",
        "Body debe ser multipart/form-data",
      );
    }

    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new CategoryAdminError(
        "MISSING_FILE",
        'Campo "image" (File) requerido en form-data',
      );
    }

    const image = await replaceCategoryImage(id, file);
    return NextResponse.json(image);
  } catch (error) {
    return handleAdminError(error, "[admin/categories/[id]/image]");
  }
}

/**
 * DELETE /api/admin/categories/[id]/image
 * Elimina la imagen principal de Cloudinary y pone a null las columnas.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    const image = await deleteCategoryImage(id);
    return NextResponse.json(image);
  } catch (error) {
    return handleAdminError(error, "[admin/categories/[id]/image]");
  }
}
