import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  ProductAdminError,
} from "@/services/product-admin.service";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/products/[id]
 * Devuelve un producto completo con variantes y nombre de categoría.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const product = await getProductById(id);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleAdminError(error, "[admin/products/:id GET]");
  }
}

/**
 * PUT /api/admin/products/[id]
 * Reemplaza campos de un producto. Body: multipart/form-data.
 * Si se envía `image` (File), se reemplaza la imagen existente.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const form = await req.formData().catch(() => null);
    if (!form) throw new ProductAdminError("VALIDATION", "Body debe ser multipart/form-data");
    const product = await updateProduct(id, form);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleAdminError(error, "[admin/products/:id PUT]");
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Reemplazo parcial: solo se actualizan los campos presentes en el FormData.
 * Si se envía `image` (File), se reemplaza usando el mismo public_id.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json(
        { error: "VALIDATION", message: "Body debe ser multipart/form-data" },
        { status: 400 },
      );
    }
    const product = await updateProduct(id, form);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id] PATCH]");
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Elimina el producto (sus variantes en cascada) y purga la imagen de
 * Cloudinary. 409 IN_USE si tiene ventas asociadas.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const result = await deleteProduct(id);
    return NextResponse.json(result);
  } catch (error) {
    return handleAdminError(error, "[admin/products/[id] DELETE]");
  }
}
