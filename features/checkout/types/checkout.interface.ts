/**
 * Contrato backend para el checkout.
 * Fuente de verdad futura: GET /api/checkout -> CheckoutSummary
 * Fase actual: mock en lib/mocks.ts (CHECKOUT_MOCK) que respeta estos tipos.
 * No importar mocks ni fetch aquí.
 */

export type CheckoutItem = {
  id: string;
  name: string;
  variantLabel: string;
  quantity: number;
  price: number;
  image: string;
};

export type CheckoutShipping = {
  email: string;
  phone: string;
  name: string;
  address: string;
  city: string;
};

export type CheckoutSummary = {
  shipping: CheckoutShipping;
  items: CheckoutItem[];
  subtotal: number;
  shippingLabel: string;
  total: number;
};
