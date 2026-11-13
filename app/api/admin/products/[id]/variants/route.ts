import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { createProductVariant } from "@/services/product-admin.service";

type Params = { params: Promise<{ id: string }> };

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
