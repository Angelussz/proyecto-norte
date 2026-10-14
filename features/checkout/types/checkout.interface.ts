/**
 * Contrato backend para el checkout.
 * Fuente de verdad: POST /api/checkout/quote -> { data: CheckoutQuote }
 * shippingCost y taxes los calcula el servidor (hoy constantes temporales).
 * La dirección de envío no viaja aquí: la muestra ShippingSummary aparte.
 * No importar mocks ni fetch.
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

export type CheckoutQuote = {
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  shippingLabel: string;
  taxes: number;
  total: number;
};
