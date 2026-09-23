import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { ProductAdminError, upsertProduct } from "@/services/product-admin.service";

/**
 * POST /api/admin/products
 * Upsert de producto. Body: multipart/form-data.
 * Si `id` existe, actualiza los campos presentes y reemplaza `image` si viene.
 * Si `id` falta o no existe, crea un producto nuevo.
 * Al crear son obligatorios: name, category_id, material, base_price.
 * Opcionales: id, slug, description, active ("true"/"false"), image (File).
 * Header: x-admin-token.
 */
export async function POST(req: NextRequest) {
  try {
    requireAdminToken(req);
    const form = await req.formData().catch(() => null);
    if (!form) {
      throw new ProductAdminError("VALIDATION", "Body debe ser multipart/form-data");
    }
    const result = await upsertProduct(form);
    return NextResponse.json(result.product, { status: result.created ? 201 : 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/products]");
  }
}
