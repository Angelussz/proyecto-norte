"use client";

import { useState } from "react";
import { CreditCard, Lock, Wallet } from "lucide-react";
import {
  loadStripe,
  type StripeCardElementChangeEvent,
  type StripeCardElementOptions,
} from "@stripe/stripe-js";
import { CardElement, Elements } from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Method = "credit_card" | "paypal";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Una sola carga de Stripe.js para toda la app (patrón oficial).
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
        checked ? "border-foreground" : "border-border"
      )}
    >
      {checked && <span className="size-2 rounded-full bg-foreground" />}
    </span>
  );
}
// ! Revisar como se envia formulario a stripe con sdk de stripe 

// Los tokens del tema están en oklch; Stripe solo acepta hex/rgb(a)/hsl.
// El truco de canvas normaliza cualquier color CSS a un formato soportado.
function normalizeColor(value: string, fallback: string): string {
  const raw = value.trim();
  if (!raw) return fallback;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = fallback;
  ctx.fillStyle = raw;
  return ctx.fillStyle;
}

function buildCardOptions(): StripeCardElementOptions {
  const fallback = {
    foreground: "#111111",
    muted: "#737373",
    danger: "#b91c1c",
    font: "Inter, sans-serif",
  };

  if (typeof window === "undefined") {
    return {
      style: {
        base: {
          fontFamily: fallback.font,
          fontSize: "16px",
          color: fallback.foreground,
          "::placeholder": { color: fallback.muted },
        },
        invalid: { color: fallback.danger, iconColor: fallback.danger },
      },
    };
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    style: {
      base: {
        fontFamily: getComputedStyle(document.body).fontFamily || fallback.font,
        fontSize: "16px",
        color: normalizeColor(styles.getPropertyValue("--foreground"), fallback.foreground),
        "::placeholder": {
          color: normalizeColor(styles.getPropertyValue("--muted-foreground"), fallback.muted),
        },
        fontSmoothing: "antialiased",
      },
      invalid: {
        color: normalizeColor(styles.getPropertyValue("--destructive"), fallback.danger),
        iconColor: normalizeColor(styles.getPropertyValue("--destructive"), fallback.danger),
      },
    },
  };
}

function CardDetailsField() {
  const [error, setError] = useState<string | null>(null);
  const [options] = useState<StripeCardElementOptions>(buildCardOptions);

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Card Details
      </Label>
      <div className="rounded-none border border-border bg-transparent px-3 py-3 transition-colors focus-within:border-foreground">
        <CardElement
          options={options}
          onChange={(event: StripeCardElementChangeEvent) => {
            setError(event.error ? (event.error.message ?? "Invalid card details") : null);
          }}
        />
      </div>
      {error ? (
        <p role="alert" className="text-xs font-semibold uppercase tracking-widest text-destructive">
          {error}
        </p>
      ) : (
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Encrypted by Stripe — test card 4242 4242 4242 4242
        </p>
      )}
    </div>
  );
}

export function PaymentMethodForm() {
  const [method, setMethod] = useState<Method>("credit_card");

  return (
    <Card className="rounded-none py-6 shadow-[4px_4px_0px_0px_var(--foreground)] md:py-8">
      <CardHeader className="px-6 md:px-8">
        <CardTitle
          className="text-3xl uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Payment Method
        </CardTitle>
        <CardDescription className="text-xs font-semibold uppercase tracking-widest">
          Secure encrypted payment
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 md:px-8">
        <div className="flex flex-col gap-4">
        <label
          className={cn(
            "relative flex cursor-pointer rounded-none border p-4 transition-colors focus:outline-none",
            method === "credit_card"
              ? "border-foreground"
              : "border-border hover:border-foreground"
          )}
        >
          <input
            type="radio"
            name="payment_method"
            value="credit_card"
            checked={method === "credit_card"}
            onChange={() => setMethod("credit_card")}
            className="sr-only"
          />
          <span className="flex w-full items-center justify-between">
            <span className="flex items-center gap-4">
              <RadioDot checked={method === "credit_card"} />
              <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Credit Card
              </span>
            </span>
            <CreditCard
              className="size-6 text-muted-foreground"
              aria-hidden
            />
          </span>
        </label>

        {method === "credit_card" && (
          <div className="ml-2 border-l border-border py-4 pl-4">
            {stripePromise ? (
              <Elements stripe={stripePromise} options={{ locale: "en" }}>
                <CardDetailsField />
              </Elements>
            ) : (
              <p role="alert" className="text-xs font-semibold uppercase tracking-widest text-destructive">
                Stripe is not configured: missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              </p>
            )}
          </div>
        )}

        <label
          className={cn(
            "relative flex cursor-pointer rounded-none border p-4 transition-all focus:outline-none",
            method === "paypal"
              ? "border-foreground opacity-100"
              : "border-border opacity-70 hover:border-foreground hover:opacity-100"
          )}
        >
          <input
            type="radio"
            name="payment_method"
            value="paypal"
            checked={method === "paypal"}
            onChange={() => setMethod("paypal")}
            className="sr-only"
          />
          <span className="flex w-full items-center justify-between">
            <span className="flex items-center gap-4">
              <RadioDot checked={method === "paypal"} />
              <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                PayPal
              </span>
            </span>
            <Wallet className="size-6 text-muted-foreground" aria-hidden />
          </span>
        </label>
        </div>
      </CardContent>
    </Card>
  );
}
