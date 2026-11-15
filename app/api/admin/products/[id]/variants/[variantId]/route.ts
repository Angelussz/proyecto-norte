import { NextRequest, NextResponse } from "next/server";
import { handleAdminError } from "@/lib/admin-api";
import { ProductAdminError } from "@/services/product-admin.service";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; variantId: string }> };

/**
 * PATCH /api/admin/products/[id]/variants/[variantId]
 * Actualiza el stock (y opcionalmente price/unit_cost/active) de una variante.
 * Body JSON: { stock?: number, price?: number, unitCost?: number, active?: boolean }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: productId, variantId } = await params;
    const body = (await req.json()) as {
      stock?: number;
      price?: number;
      unitCost?: number;
      active?: boolean;
    };

    // Verificar que la variante pertenece al producto indicado
    const existing = await prisma.productVariants.findUnique({
      where: { id: variantId },
      select: { id: true, product_id: true },
    });

    if (!existing) {
      throw new ProductAdminError("NOT_FOUND", `No existe la variante ${variantId}`);
    }
    if (existing.product_id !== productId) {
      throw new ProductAdminError(
        "VALIDATION",
        `La variante ${variantId} no pertenece al producto ${productId}`,
      );
    }

    const data: { stock?: number; price?: number; unit_cost?: number; active?: boolean } = {};

    if (typeof body.stock === "number") {
      if (body.stock < 0) throw new ProductAdminError("VALIDATION", "stock no puede ser negativo");
      data.stock = body.stock;
    }
    if (typeof body.price === "number") {
      if (body.price < 0) throw new ProductAdminError("VALIDATION", "price no puede ser negativo");
      data.price = body.price;
    }
    if (typeof body.unitCost === "number") {
      data.unit_cost = body.unitCost;
    }
    if (typeof body.active === "boolean") {
      data.active = body.active;
    }

    if (Object.keys(data).length === 0) {
      throw new ProductAdminError("VALIDATION", "No hay campos para actualizar");
    }

    const updated = await prisma.productVariants.update({
      where: { id: variantId },
      data,
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        sku: updated.sku,
        size: updated.size,
        color: updated.color,
        price: Number(updated.price),
        unitCost: Number(updated.unit_cost),
        stock: updated.stock,
        active: updated.active,
      },
    });
  } catch (err) {
    return handleAdminError(err, "PATCH /api/admin/products/[id]/variants/[variantId]");
  }
}
