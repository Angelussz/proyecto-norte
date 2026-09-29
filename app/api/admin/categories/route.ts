import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import {
  CategoryAdminError,
  createCategory,
} from "@/services/category-admin.service";

/**
 * POST /api/admin/categories
 * Crea una categoría. Body: multipart/form-data.
 * Obligatorio: name. Opcionales: parent_category_id, slug, description,
 * image (File).
 * Header: x-admin-token.
 */
export async function POST(req: NextRequest) {
  try {
    requireAdminToken(req);
    const form = await req.formData().catch(() => null);
    if (!form) {
      throw new CategoryAdminError(
        "VALIDATION",
        "Body debe ser multipart/form-data",
      );
    }
    const category = await createCategory(form);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleAdminError(error, "[admin/categories]");
  }
}
