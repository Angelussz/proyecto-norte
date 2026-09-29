import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import {
  CategoryAdminError,
  deleteCategory,
  updateCategory,
} from "@/services/category-admin.service";

/**
 * PATCH /api/admin/categories/[id]
 * Reemplazo parcial: solo se actualizan los campos presentes en el FormData.
 * Si se envía `image` (File), se reemplaza usando el mismo public_id.
 * Header: x-admin-token.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json(
        { error: "VALIDATION", message: "Body debe ser multipart/form-data" },
        { status: 400 },
      );
    }
    const category = await updateCategory(id, form);
    return NextResponse.json(category);
  } catch (error) {
    return handleAdminError(error, "[admin/categories/[id]]");
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Elimina la categoría y purga su imagen de Cloudinary. 409 IN_USE si tiene
 * productos asociados (las subcategorías quedan huérfanas, no se borran).
 * Header: x-admin-token.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleAdminError(error, "[admin/categories/[id]]");
  }
}
