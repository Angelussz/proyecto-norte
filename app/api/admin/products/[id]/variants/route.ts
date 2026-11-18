import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { createProductVariant, getProductById } from "@/services/product-admin.service";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/products/[id]/variants
 * Obtiene todas las variantes del producto.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ data: product.variants });
  } catch (err) {
    return handleAdminError(err, "GET /api/admin/products/[id]/variants");
  }
}

/**
 * POST /api/admin/products/[id]/variants
 * Crea una variante para el producto indicado.
 * Body JSON: { size, color, colorHex, stock, sku?, price?, unitCost? }
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const variant = await createProductVariant(id, body);
    return NextResponse.json({ data: variant }, { status: 201 });
  } catch (err) {
    return handleAdminError(err, "POST /api/admin/products/[id]/variants");
  }
}
