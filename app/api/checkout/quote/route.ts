import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  CheckoutItem,
  CheckoutQuote,
} from "@/features/checkout/types/checkout.interface";

// ── Reglas de negocio (constantes temporales) ─────────────────────────────
// TODO(futuro sprint): el envío variará por zona/peso/promociones y los
// impuestos por régimen fiscal. Hoy son valores fijos para el resumen.
const SHIPPING_FLAT_RATE = 9.9;
const SHIPPING_LABEL = "Tarifa plana";
const TAX_RATE = 0.18; // IGV, aplicado sobre el subtotal

const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 10;
const FALLBACK_IMAGE = "/hero-nuevo.jpg";

type QuoteProblemReason = "not_found" | "inactive" | "insufficient_stock";

type QuoteProblem = {
  variantId: string;
  reason: QuoteProblemReason;
  availableStock?: number;
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * POST /api/checkout/quote
 * Cotiza el resumen del pedido a partir del carrito del cliente.
 * Solo calcula: no crea la orden, no descuenta stock ni emite comprobantes.
 * No requiere autenticación.
 *
 * Body: { items: [{ variantId: string, quantity: number }] }
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  const rawItems = (body as { items?: unknown })?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json(
      { error: "items debe ser un arreglo no vacío" },
      { status: 400 }
    );
  }
  if (rawItems.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `items no puede tener más de ${MAX_ITEMS} elementos` },
      { status: 400 }
    );
  }

  const cleaned: { variantId: string; quantity: number }[] = [];
  for (let index = 0; index < rawItems.length; index++) {
    const raw = rawItems[index] as {
      variantId?: unknown;
      quantity?: unknown;
    };
    const variantId =
      typeof raw?.variantId === "string" ? raw.variantId.trim() : "";
    const quantity = raw?.quantity;

    if (variantId.length === 0) {
      return NextResponse.json(
        { error: `items[${index}].variantId inválido` },
        { status: 400 }
      );
    }
    if (
      !Number.isInteger(quantity) ||
      (quantity as number) < 1 ||
      (quantity as number) > MAX_QUANTITY_PER_ITEM
    ) {
      return NextResponse.json(
        {
          error: `items[${index}].quantity debe ser un entero entre 1 y ${MAX_QUANTITY_PER_ITEM}`,
        },
        { status: 400 }
      );
    }

    cleaned.push({ variantId, quantity: quantity as number });
  }

  try {
    const variants = await prisma.productVariants.findMany({
      where: { id: { in: cleaned.map((item) => item.variantId) } },
      include: {
        product: {
          select: {
            name: true,
            image_url: true,
            active: true,
          },
        },
      },
    });

    const byId = new Map(variants.map((variant) => [variant.id, variant]));
    const problems: QuoteProblem[] = [];
    const items: CheckoutItem[] = [];

    for (const { variantId, quantity } of cleaned) {
      const variant = byId.get(variantId);

      if (!variant) {
        problems.push({ variantId, reason: "not_found" });
        continue;
      }
      if (!variant.active || !variant.product.active) {
        problems.push({ variantId, reason: "inactive" });
        continue;
      }
      if (variant.stock < quantity) {
        problems.push({
          variantId,
          reason: "insufficient_stock",
          availableStock: variant.stock,
        });
        continue;
      }

      items.push({
        id: variant.id,
        name: variant.product.name,
        variantLabel: `${variant.color} / ${variant.size}`,
        quantity,
        price: Number(variant.price),
        image:
          variant.image_url ?? variant.product.image_url ?? FALLBACK_IMAGE,
      });
    }

    if (problems.length > 0) {
      return NextResponse.json(
        {
          error: "Uno o más productos ya no están disponibles",
          problems,
        },
        { status: 422 }
      );
    }

    const subtotal = round2(
      items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
    const shippingCost = SHIPPING_FLAT_RATE;
    const taxes = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + shippingCost + taxes);

    const data: CheckoutQuote = {
      items,
      subtotal,
      shippingCost,
      shippingLabel: SHIPPING_LABEL,
      taxes,
      total,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error(
      "[POST /api/checkout/quote] Base de datos no disponible:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { error: "No se pudo calcular el resumen del pedido" },
      { status: 500 }
    );
  }
}
