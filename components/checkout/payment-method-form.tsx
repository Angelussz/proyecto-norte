"use client";

import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const underlineInput =
  "rounded-none border-0 border-b border-border bg-transparent px-0 py-2 shadow-none focus-visible:border-foreground focus-visible:ring-0 placeholder:text-muted-foreground";

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
          <div className="ml-2 grid grid-cols-1 gap-x-4 gap-y-6 border-l border-border py-4 pl-4 sm:grid-cols-6">
            <div className="col-span-full">
              <Label
                htmlFor="cc-number"
                className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Card Number
              </Label>
              <Input
                id="cc-number"
                name="cc-number"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                className={underlineInput}
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label
                htmlFor="cc-exp"
                className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Expiration Date
              </Label>
              <Input
                id="cc-exp"
                name="cc-exp"
                type="text"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                className={underlineInput}
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label
                htmlFor="cc-cvc"
                className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                CVC
              </Label>
              <Input
                id="cc-cvc"
                name="cc-cvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                className={underlineInput}
              />
            </div>
            <div className="col-span-full mt-2">
              <Label
                htmlFor="cc-name"
                className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Name on Card
              </Label>
              <Input
                id="cc-name"
                name="cc-name"
                type="text"
                autoComplete="cc-name"
                placeholder="JANE DOE"
                className={cn(underlineInput, "uppercase")}
              />
            </div>
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
