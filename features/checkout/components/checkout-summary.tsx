"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useCart } from "@/features/cart/hooks";
import {
  CheckoutQuoteError,
  getCheckoutQuote,
} from "@/features/checkout/services/checkout.service";
import { OrderSummary } from "@/features/checkout/components/order-summary";
import { PlaceOrderButton } from "@/features/checkout/components/place-order-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Resumen del checkout con datos reales:
 * lee el carrito vivo (sincronizado con la siembra inicial y sus cambios)
 * y cotiza subtotal + envío + impuestos con POST /api/checkout/quote.
 */
export function CheckoutSummary() {
  const { items } = useCart();

  const quoteInput = useMemo(
    () =>
      items.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      })),
    [items]
  );
  const quoteKey = useMemo(
    () =>
      quoteInput
        .map((item) => `${item.variantId}:${item.quantity}`)
        .join(","),
    [quoteInput]
  );

  const quoteQuery = useQuery({
    queryKey: ["checkout", "quote", quoteKey],
    queryFn: ({ signal }) => getCheckoutQuote(quoteInput, { signal }),
    enabled: quoteInput.length > 0,
  });

  if (quoteInput.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Tu carrito está vacío.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
        >
          Seguir comprando
        </Link>
      </div>
    );
  }

  if (quoteQuery.data) {
    return (
      <OrderSummary
        summary={quoteQuery.data}
        action={<PlaceOrderButton />}
      />
    );
  }

  if (quoteQuery.isPending || quoteQuery.isFetching) {
    return (
      <Card
        className="rounded-none bg-muted py-6 md:py-8"
        aria-busy="true"
      >
        <CardHeader className="px-6 md:px-8">
          <div className="h-7 w-48 animate-pulse bg-muted-foreground/20" />
        </CardHeader>
        <CardContent className="px-6 md:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted-foreground/10" />
            <div className="h-24 bg-muted-foreground/10" />
            <div className="h-4 w-2/3 bg-muted-foreground/20" />
            <div className="h-4 w-1/2 bg-muted-foreground/20" />
            <div className="h-6 w-1/3 bg-muted-foreground/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quoteQuery.isError) {
    const isUnavailable =
      quoteQuery.error instanceof CheckoutQuoteError &&
      quoteQuery.error.status === 422;

    return (
      <div className="py-12 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {isUnavailable
            ? "Uno o más productos de tu carrito ya no están disponibles."
            : "No pudimos calcular tu resumen."}
        </p>
        {isUnavailable ? (
          <Link
            href="/cart"
            className="mt-4 inline-block text-sm font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
          >
            Revisar carrito
          </Link>
        ) : (
          <button
            onClick={() => quoteQuery.refetch()}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        )}
      </div>
    );
  }

  return null;
}
