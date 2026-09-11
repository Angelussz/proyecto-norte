import type { CheckoutShipping } from "@/interfaces/checkout.interface";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ShippingSummary({ shipping }: { shipping: CheckoutShipping }) {
  return (
    <Card className="rounded-none py-6 md:py-8">
      <CardHeader className="px-6 md:px-8">
        <CardTitle
          className="text-3xl uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Shipping Information
        </CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground underline decoration-1 underline-offset-4 hover:text-foreground"
          >
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-6 md:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-base text-muted-foreground md:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold text-foreground">Contact</p>
            <p>{shipping.email}</p>
            <p>{shipping.phone}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">Ship To</p>
            <p>{shipping.name}</p>
            <p>{shipping.address}</p>
            <p>{shipping.city}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
