import { getBaseUrl } from "@/features/product/services/product-catalog.service";
import type { CheckoutQuote } from "@/features/checkout/types/checkout.interface";

export type CheckoutQuoteInput = {
  variantId: string;
  quantity: number;
};

export class CheckoutQuoteError extends Error {
  status: number;

  constructor(status: number) {
    super(`[checkout.service] POST /api/checkout/quote devolvió ${status}`);
    this.status = status;
  }
}

/**
 * Servicio del checkout.
 * Consume: POST /api/checkout/quote
 * Lanza un error si la API falla; no usa fallback mock en el cliente.
 */
export async function getCheckoutQuote(
  items: CheckoutQuoteInput[],
  options?: { signal?: AbortSignal }
): Promise<CheckoutQuote> {
  const res = await fetch(`${getBaseUrl()}/api/checkout/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new CheckoutQuoteError(res.status);
  }

  const payload = (await res.json()) as { data: CheckoutQuote };
  return payload.data;
}
