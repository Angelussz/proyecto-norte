import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Una sola carga de Stripe.js para toda la app (patrón oficial).
// null si falta la clave publicable (la UI muestra el aviso correspondiente).
export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;
