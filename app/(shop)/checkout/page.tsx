import type { Metadata } from "next";
import { CheckoutContent } from "@/features/checkout/components/checkout-content";

export const metadata: Metadata = {
  title: "Checkout — NORTE",
  description: "Complete your NORTE order: shipping, payment and review.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-5 py-8 md:px-16 md:py-12 lg:flex-row">
      <CheckoutContent />
    </main>
  );
}
