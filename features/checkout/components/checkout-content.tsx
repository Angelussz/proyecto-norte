"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { CheckCircle2 } from "lucide-react";
import { stripePromise } from "@/lib/stripe-client";
import { useCart } from "@/features/cart/hooks";
import { CardElementProvider } from "@/features/checkout/components/card-element-context";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { ShippingSummary } from "@/features/checkout/components/shipping-summary";
import { PaymentMethodForm } from "@/features/checkout/components/payment-method-form";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

/**
 * Contenido del checkout envuelto en el contexto Elements de Stripe,
 * compartido por el formulario de tarjeta y el botón de pago.
 */
export function CheckoutContent() {
  const [shippingReady, setShippingReady] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const { clearCart } = useCart();

  const handleOrderSuccess = () => {
    setOrderCompleted(true);
    clearCart();
  };

  const content = orderCompleted ? (
    <section
      role="status"
      aria-live="polite"
      className="w-full border border-border bg-card px-6 py-10 text-center shadow-sm"
    >
      <div className="mx-auto mb-6 flex size-16 items-center justify-center border border-primary/20 bg-primary/5 text-primary">
        <CheckCircle2 className="size-9" aria-hidden="true" />
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Compra confirmada
      </p>

      <h2 className="mb-4 text-2xl font-semibold uppercase tracking-wide text-foreground">
        ¡Gracias por tu compra!
      </h2>

      <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">
        Tu pago fue aprobado y recibimos correctamente tu pedido. Estamos preparando todo para que
        puedas disfrutar tu compra.
      </p>

      <div className="mx-auto mt-8 max-w-sm border-t border-border pt-5">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground">
          Gracias por elegir NORTE
        </p>
      </div>
    </section>
  ) : (
    <>
      <div className="flex w-full flex-col gap-14 lg:w-2/3">
        <CheckoutSteps />
        <ShippingSummary onShippingChange={setShippingReady} />
        <PaymentMethodForm />
      </div>
      <div className="w-full lg:w-1/3">
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary shippingReady={shippingReady} onOrderSuccess={handleOrderSuccess} />
        </div>
      </div>
    </>
  );

  if (!stripePromise) {
    return (
      <CardElementProvider>
        <p
          role="alert"
          className="w-full text-xs font-semibold uppercase tracking-widest text-destructive"
        >
          Falta configuración de NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </p>
        {content}
      </CardElementProvider>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ locale: "es" }}>
      <CardElementProvider>{content}</CardElementProvider>
    </Elements>
  );
}
