import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import {
  deleteProduct,
  updateProduct,
} from "@/services/product-admin.service";

/**
 * PATCH /api/admin/products/[id]
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
    const product = await updateProduct(id, form);
    return NextResponse.json(product);
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id]]");
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Elimina el producto (sus variantes en cascada) y purga la imagen de
 * Cloudinary. 409 IN_USE si tiene ventas asociadas.
 * Header: x-admin-token.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdminToken(req);
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id]]");
  }
}
