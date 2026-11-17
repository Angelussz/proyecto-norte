"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CheckoutShipping } from "@/features/checkout/types/checkout.interface";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShippingSummaryProps {
  onShippingChange: (ready: boolean) => void;
}

export function ShippingSummary({ onShippingChange }: ShippingSummaryProps) {
  const [shipping, setShipping] = useState<CheckoutShipping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadShipping() {
      setLoading(true);
      setError(null);
      onShippingChange(false);

      try {
        const response = await fetch("/api/checkout/shipping", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          data?: CheckoutShipping;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "No se pudieron cargar los datos de envío.");
        }

        if (!payload.data) {
          throw new Error("La respuesta no contiene los datos de envío.");
        }

        setShipping(payload.data);
        onShippingChange(true);
      } catch (err) {
        if (controller.signal.aborted) return;

        setShipping(null);
        onShippingChange(false);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error al cargar los datos de envío.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadShipping();

    return () => controller.abort();
  }, [onShippingChange]);

  return (
    <Card className="rounded-none py-6 md:py-8">
      <CardHeader className="px-6 md:px-8">
        <CardTitle
          className="text-3xl uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Envío
        </CardTitle>

        <CardAction>
          <Link
            href="/account/addresses"
            className="text-sm font-medium underline underline-offset-4 hover:text-primary"
          >
            Editar dirección
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="px-6 md:px-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando tus datos de envío...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : shipping ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-base text-muted-foreground md:grid-cols-2">
            <div>
              <p className="mb-1 font-semibold text-foreground">Contacto</p>
              <p>{shipping.email}</p>
              <p>{shipping.phone}</p>
            </div>

            <div>
              <p className="mb-1 font-semibold text-foreground">Enviar a</p>
              <p>{shipping.name}</p>
              <p>{shipping.address}</p>
              <p>{shipping.city}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
