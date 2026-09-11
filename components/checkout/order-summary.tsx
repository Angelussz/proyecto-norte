import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import type { CheckoutSummary } from "@/interfaces/checkout.interface";

export function OrderSummary({ summary }: { summary: CheckoutSummary }) {
  return (
    <Card className="rounded-none bg-muted py-6 md:py-8">
      <CardHeader className="px-6 md:px-8">
        <CardTitle
          className="text-2xl uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 md:px-8">
        <ul
          role="list"
          className="mb-6 divide-y divide-border border-b border-border"
        >
          {summary.items.map((item) => (
            <li key={item.id} className="flex py-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden border border-border bg-card">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col justify-center">
                <div className="flex justify-between gap-4 text-base text-foreground">
                  <h4
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {item.name}
                  </h4>
                  <p className="ml-4 font-semibold">{formatPrice(item.price)}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.variantLabel}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Qty {item.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="space-y-4 text-sm text-foreground">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold">{formatPrice(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-semibold">{summary.shippingLabel}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-4">
            <dt className="text-base font-bold uppercase tracking-wider">
              Total
            </dt>
            <dd className="text-base font-bold">
              {formatPrice(summary.total)}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 bg-transparent px-6 md:px-8">
        <Button
          type="button"
          size="lg"
          className="flex h-auto w-full items-center justify-center gap-2 rounded-none py-4 text-sm font-semibold uppercase tracking-widest"
        >
          Place Order
          <Lock className="size-[18px]" aria-hidden />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By placing your order, you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
