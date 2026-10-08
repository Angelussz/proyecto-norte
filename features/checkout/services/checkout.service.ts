import { getBaseUrl } from "@/features/product/services/product-catalog.service";
import type { CheckoutQuote } from "@/features/checkout/types/checkout.interface";

export type CheckoutQuoteInput = {
  variantId: string;
  quantity: number;
};

export type CreatePaymentIntentInput = {
  variantId: string;
  quantity: number;
};

export type CreatePaymentIntentResult = {
  orderId: string;
  clientSecret: string;
  total: number;
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

/**
 * Crea (o reutiliza) la orden y el PaymentIntent en Stripe.
 * Consume: POST /api/checkout/payment-intent
 * Solo debe llamarse al iniciar el pago ("Place Order").
 * Lanza un error si la API falla; no usa fallback mock en el cliente.
 */
export async function createPaymentIntent(
  items: CreatePaymentIntentInput[],
  options?: { signal?: AbortSignal }
): Promise<CreatePaymentIntentResult> {
  const res = await fetch(`${getBaseUrl()}/api/checkout/payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new CheckoutQuoteError(res.status);
  }

  const payload = (await res.json()) as { data: CreatePaymentIntentResult };
  return payload.data;
}
