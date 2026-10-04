"use client";

import { useState } from "react";
import {
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/hooks";
import {
  CheckoutQuoteError,
  createPaymentIntent,
  type CreatePaymentIntentInput,
} from "@/features/checkout/services/checkout.service";

type PayStatus = "idle" | "confirming" | "processing" | "succeeded" | "error";

const POLL_ATTEMPTS = 20;
const POLL_DELAY_MS = 1500;

/**
 * Espera a que el webhook marque la orden PAID en la DB.
 * El éxito de confirmCardPayment solo dice que Stripe cobró; la verdad
 * para vaciar el carrito es GET /api/orders/[id] -> status PAID.
 */
async function waitForOrderPaid(
  orderId: string
): Promise<"PAID" | "CANCELLED" | "TIMEOUT"> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const order = (await res.json()) as { status?: string };
        if (order.status === "PAID") return "PAID";
        if (order.status === "CANCELLED") return "CANCELLED";
      }
    } catch {
      // Reintentar en el siguiente ciclo.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
  }
  return "TIMEOUT";
}

/**
 * Botón "Place Order": crea el PaymentIntent con el carrito vivo (mutación
 * TanStack, fase 1) y confirma la tarjeta ante Stripe (fase 2, manual porque
 * usa Stripe.js y el 3D Secure, no un fetch). Requiere el contexto Elements.
 */
export function PlaceOrderButton() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState<PayStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const intentMutation = useMutation({
    mutationFn: (input: CreatePaymentIntentInput[]) =>
      createPaymentIntent(input),
  });

  const isProcessing =
    intentMutation.isPending ||
    status === "confirming" ||
    status === "processing";
  const disabled =
    !stripe || !elements || items.length === 0 || isProcessing;

  const handleClick = () => {
    if (!stripe || !elements || intentMutation.isPending) return;

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

          const { error, paymentIntent } =
            await stripe.confirmCardPayment(clientSecret, {
              payment_method: { card },
            });

          if (error) {
            setStatus("error");
            setErrorMessage(error.message ?? "El pago fue rechazado");
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
              setErrorMessage(
                "El pago no pudo completarse. Revisa tu carrito."
              );
            } else {
              setStatus("error");
              setErrorMessage(
                "Pago recibido, la confirmación está tardando. Revisa tus pedidos en unos minutos."
              );
            }
          } else {
            setStatus("error");
            setErrorMessage(
              `Pago no completado (${paymentIntent?.status ?? "desconocido"})`
            );
          }
        },
        onError: (err) => {
          setStatus("error");
          if (err instanceof CheckoutQuoteError && err.status === 422) {
            setErrorMessage(
              "Uno o más productos ya no están disponibles. Revisa tu carrito."
            );
          } else {
            setErrorMessage(
              "No pudimos procesar tu pago. Inténtalo de nuevo."
            );
          }
        },
      }
    );
  };

  if (status === "succeeded") {
    return (
      <p
        role="status"
        className="py-4 text-center text-sm font-semibold uppercase tracking-widest text-foreground"
      >
        ¡Pago exitoso! Gracias por tu compra.
      </p>
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
            : "Place Order"}
        <Lock className="size-4.5" aria-hidden />
      </Button>
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
