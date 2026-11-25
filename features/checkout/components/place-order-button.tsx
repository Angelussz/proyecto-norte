"use client";

import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/hooks";
import {
  CheckoutQuoteError,
  createPaymentIntent,
  type CreatePaymentIntentInput,
} from "@/features/checkout/services/checkout.service";
import { useCardElementState } from "@/features/checkout/components/card-element-context";

type PayStatus = "idle" | "confirming" | "processing" | "succeeded" | "error";

const POLL_ATTEMPTS = 20;
const POLL_DELAY_MS = 1500;

interface PlaceOrderButtonProps {
  shippingReady: boolean;
}

/**
 * Espera a que el webhook marque la orden PAID en la DB.
 * Solo se vacía el carrito cuando la orden figura como PAID.
 */
async function waitForOrderPaid(
  orderId: string,
): Promise<"PAID" | "CANCELLED" | "TIMEOUT" | "AUTH_ERROR" | "NOT_FOUND" | "SERVER_ERROR"> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });

      if (res.status === 401) return "AUTH_ERROR";
      if (res.status === 404) return "NOT_FOUND";
      if (res.status >= 500) return "SERVER_ERROR";

      if (res.ok) {
        const order = (await res.json()) as { status?: string };

        if (order.status === "PAID") return "PAID";
        if (order.status === "CANCELLED") return "CANCELLED";
      }
    } catch {
      // Reintentar ante errores temporales de conexión.
    }

    if (attempt < POLL_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
    }
  }

  return "TIMEOUT";
}

/**
 * Crea el PaymentIntent y confirma la tarjeta con Stripe.
 * El carrito solo se vacía cuando la orden queda PAID en la base de datos.
 */
export function PlaceOrderButton({ shippingReady }: PlaceOrderButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCart();
  const { cardComplete } = useCardElementState();
  const [status, setStatus] = useState<PayStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intentMutation = useMutation({
    mutationFn: (input: CreatePaymentIntentInput[]) => createPaymentIntent(input),
  });

  const isProcessing =
    intentMutation.isPending || status === "confirming" || status === "processing";

  const disabled =
    !shippingReady || !stripe || !elements || items.length === 0 || !cardComplete || isProcessing;

  const handleClick = () => {
    if (!shippingReady || !stripe || !elements || intentMutation.isPending) {
      return;
    }

    if (!cardComplete) {
      setStatus("error");
      setErrorMessage("Completa los datos de tu tarjeta.");
      return;
    }

    setStatus("idle");
    setErrorMessage(null);

    intentMutation.mutate(
      items.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      })),
      {
        onSuccess: async ({ clientSecret, orderId }) => {
          const card = elements.getElement(CardElement);

          if (!card) {
            setStatus("error");
            setErrorMessage("No pudimos leer tu tarjeta. Recarga la página.");
            return;
          }

          setStatus("confirming");

          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card },
          });

          if (error) {
            setStatus("error");
            setErrorMessage(error.message ?? "El pago fue rechazado.");
            return;
          }

          if (paymentIntent?.status === "succeeded") {
            setStatus("processing");

            const result = await waitForOrderPaid(orderId);

            if (result === "PAID") {
              setStatus("succeeded");
              clearCart();
            } else if (result === "CANCELLED") {
              setStatus("error");
              setErrorMessage("El pago no pudo completarse. Revisa el estado de tu pedido.");
            } else if (result === "AUTH_ERROR") {
              setStatus("error");
              setErrorMessage(
                "Tu sesión expiró. Iniciá sesión y revisá el estado de tu pedido antes de volver a pagar.",
              );
            } else if (result === "NOT_FOUND") {
              setStatus("error");
              setErrorMessage(
                "No encontramos tu orden. Contactá con soporte antes de volver a pagar.",
              );
            } else if (result === "SERVER_ERROR") {
              setStatus("error");
              setErrorMessage(
                "No pudimos consultar el estado de tu orden. Revisalo nuevamente antes de volver a pagar.",
              );
            } else {
              setStatus("error");
              setErrorMessage(
                "La confirmación está tardando. Revisá tus pedidos antes de volver a pagar.",
              );
            }
          } else {
            setStatus("error");
            setErrorMessage(`Pago no completado (${paymentIntent?.status ?? "desconocido"}).`);
          }
        },
        onError: (err) => {
          setStatus("error");

          if (err instanceof CheckoutQuoteError && err.status === 422) {
            setErrorMessage("Uno o más productos ya no están disponibles. Revisa tu carrito.");
          } else {
            setErrorMessage("No pudimos procesar tu pago. Inténtalo de nuevo.");
          }
        },
      },
    );
  };

  if (status === "succeeded") {
    return (
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
    );
  }

  return (
    <div>
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        onClick={handleClick}
        className="flex h-auto w-full items-center justify-center gap-2 rounded-none py-4 text-sm font-semibold uppercase tracking-widest"
      >
        {status === "processing"
          ? "Confirmando pago..."
          : isProcessing
            ? "Processing..."
            : !shippingReady
              ? "Verificando envío..."
              : "Place Order"}
        <Lock className="size-4.5" aria-hidden />
      </Button>

      {!shippingReady ? (
        <p role="status" className="mt-3 text-center text-xs text-muted-foreground">
          Verificá que tus datos de envío estén cargados antes de pagar.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p
          role="alert"
          className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
