"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { CHECKOUT_SHIPPING_MOCK } from "@/lib/mocks";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { ShippingSummary } from "@/features/checkout/components/shipping-summary";
import { PaymentMethodForm } from "@/features/checkout/components/payment-method-form";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

/**
 * Contenido del checkout envuelto en el contexto Elements de Stripe,
 * compartido por el formulario de tarjeta y el botón de pago.
 */
export function CheckoutContent() {
  const content = (
    <>
      <div className="flex w-full flex-col gap-14 lg:w-2/3">
        <CheckoutSteps />
        <ShippingSummary shipping={CHECKOUT_SHIPPING_MOCK} />
        <PaymentMethodForm />
      </div>
      <div className="w-full lg:w-1/3">
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary />
        </div>
      </div>
    </>
  );

  if (!stripePromise) {
    return (
      <>
        <p
          role="alert"
          className="w-full text-xs font-semibold uppercase tracking-widest text-destructive"
        >
          Stripe is not configured: missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </p>
        {content}
      </>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ locale: "es" }}>
      {content}
    </Elements>
  );
}
