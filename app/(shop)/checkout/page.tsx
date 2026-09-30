import type { Metadata } from "next";
import { CHECKOUT_SHIPPING_MOCK } from "@/lib/mocks";
import { CheckoutSteps } from "@/features/checkout/components/checkout-steps";
import { ShippingSummary } from "@/features/checkout/components/shipping-summary";
import { PaymentMethodForm } from "@/features/checkout/components/payment-method-form";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

export const metadata: Metadata = {
  title: "Checkout — NORTE",
  description: "Complete your NORTE order: shipping, payment and review.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-5 py-8 md:px-16 md:py-12 lg:flex-row">
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
    </main>
  );
}
