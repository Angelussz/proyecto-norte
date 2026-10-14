import { prisma } from "@/lib/prisma";
import type {
  CheckoutItem,
  CheckoutQuote,
} from "@/features/checkout/types/checkout.interface";

// ── Reglas de negocio (constantes temporales) ─────────────────────────────
// TODO(futuro sprint): el envío variará por zona/peso/promociones y los
// impuestos por régimen fiscal. Hoy son valores fijos para el resumen.
export const SHIPPING_FLAT_RATE = 9.9;
export const SHIPPING_LABEL = "Tarifa plana";
export const TAX_RATE = 0.18; // IGV, aplicado sobre el subtotal

export const MAX_ITEMS = 50;
export const MAX_QUANTITY_PER_ITEM = 10;
export const FALLBACK_IMAGE = "/hero-nuevo.jpg";

export type QuoteProblemReason = "not_found" | "inactive" | "insufficient_stock";

export type QuoteProblem = {
  variantId: string;
  reason: QuoteProblemReason;
  availableStock?: number;
};

export type CleanedQuoteItem = {
  variantId: string;
  quantity: number;
};

export type ValidatedQuoteItem = {
  variantId: string;
  sku: string;
  productName: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
};

export class QuoteHttpError extends Error {
  status: number;
  problems?: QuoteProblem[];

  constructor(status: number, message: string, problems?: QuoteProblem[]) {
    super(message);
    this.status = status;
    this.problems = problems;
  }
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Valida el body { items: [{ variantId, quantity }] }.
 * Lanza QuoteHttpError(400) si el payload es inválido.
 */
export function parseQuoteItems(body: unknown): CleanedQuoteItem[] {
  const rawItems = (body as { items?: unknown })?.items;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new QuoteHttpError(400, "items debe ser un arreglo no vacío");
  }
  if (rawItems.length > MAX_ITEMS) {
    throw new QuoteHttpError(
      400,
      `items no puede tener más de ${MAX_ITEMS} elementos`
    );
  }

  const cleaned: CleanedQuoteItem[] = [];
  for (let index = 0; index < rawItems.length; index++) {
    const raw = rawItems[index] as {
      variantId?: unknown;
      quantity?: unknown;
    };
    const variantId =
      typeof raw?.variantId === "string" ? raw.variantId.trim() : "";
    const quantity = raw?.quantity;

    if (variantId.length === 0) {
      throw new QuoteHttpError(400, `items[${index}].variantId inválido`);
    }
    if (
      !Number.isInteger(quantity) ||
      (quantity as number) < 1 ||
      (quantity as number) > MAX_QUANTITY_PER_ITEM
    ) {
      throw new QuoteHttpError(
        400,
        `items[${index}].quantity debe ser un entero entre 1 y ${MAX_QUANTITY_PER_ITEM}`
      );
    }

    cleaned.push({ variantId, quantity: quantity as number });
  }

  return cleaned;
}

/**
 * Resuelve los items contra la BD (precios y stock siempre desde la BD).
 * Lanza QuoteHttpError(422) si alguna variante no existe, está inactiva
 * o no tiene stock suficiente.
 */
export async function validateQuoteItems(
  cleaned: CleanedQuoteItem[]
): Promise<ValidatedQuoteItem[]> {
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
  const validated: ValidatedQuoteItem[] = [];

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

    validated.push({
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.product.name,
      color: variant.color,
      size: variant.size,
      unitPrice: Number(variant.price),
      quantity,
      imageUrl:
        variant.image_url ?? variant.product.image_url ?? FALLBACK_IMAGE,
    });
  }

  if (problems.length > 0) {
    throw new QuoteHttpError(
      422,
      "Uno o más productos ya no están disponibles",
      problems
    );
  }

  return validated;
}

export function toCheckoutItems(
  validated: ValidatedQuoteItem[]
): CheckoutItem[] {
  return validated.map((item) => ({
    id: item.variantId,
    name: item.productName,
    variantLabel: `${item.color} / ${item.size}`,
    quantity: item.quantity,
    price: item.unitPrice,
    image: item.imageUrl,
  }));
}

/**
 * Calcula subtotal + envío + impuestos + total.
 */
export function calculateQuoteTotals(items: CheckoutItem[]): {
  subtotal: number;
  shippingCost: number;
  shippingLabel: string;
  taxes: number;
  total: number;
} {
  const subtotal = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );
  const shippingCost = SHIPPING_FLAT_RATE;
  const taxes = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + shippingCost + taxes);

  return {
    subtotal,
    shippingCost,
    shippingLabel: SHIPPING_LABEL,
    taxes,
    total,
  };
}

/**
 * Cotización completa: valida, resuelve y calcula.
 * Misma lógica para POST /api/checkout/quote y payment-intent.
 */
export async function buildCheckoutQuote(
  body: unknown
): Promise<CheckoutQuote> {
  const cleaned = parseQuoteItems(body);
  const validated = await validateQuoteItems(cleaned);
  const items = toCheckoutItems(validated);
  const totals = calculateQuoteTotals(items);

  return { items, ...totals };
}
