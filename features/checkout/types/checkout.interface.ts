/**
 * Contrato backend para el checkout.
 * Fuente de verdad: POST /api/checkout/quote -> { data: CheckoutQuote }
 * shippingCost y taxes los calcula el servidor (hoy constantes temporales).
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
  shippingCost: number;
  shippingLabel: string;
  taxes: number;
  total: number;
};

/**
 * Respuesta de POST /api/checkout/quote.
 * Igual al resumen pero sin dirección: el cliente aún no la envía.
 */
export type CheckoutQuote = Omit<CheckoutSummary, "shipping">;
