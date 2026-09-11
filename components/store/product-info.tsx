"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Truck } from "lucide-react";
import { formatPrice, isSizeAvailable } from "@/lib/products";
import type { ProductDetail } from "@/interfaces/product.interface";
import { Button } from "@/components/ui/button";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const firstAvailable = useMemo(
    () => product.variants.find(isSizeAvailable)?.size ?? "",
    [product]
  );
  const [size, setSize] = useState(firstAvailable);
  const [selected, setSelected] = useState(product.colors[0]?.name ?? "");

  const currentColor = product.colors.find((c) => c.name === selected) ?? product.colors[0];

  const activeVariant = product.variants.find((v) => v.size === size);
  const activeStock = activeVariant?.stock ?? 0;

  return (
    <div className="flex flex-col pt-4 md:pt-0">
      <div className="mb-8">
        <h1
          className="mb-2 text-4xl uppercase tracking-wide text-foreground md:text-5xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          {product.name}
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          {formatPrice(product.price)}
        </p>
        <p className="leading-relaxed text-muted-foreground">{product.description}</p>
      </div>

      <div className="mb-8">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Color:{" "}
              <span className="font-normal text-muted-foreground">{currentColor?.name}</span>
            </span>
          </div>
          <div className="flex gap-3">
            {product.colors.map((color) => {
              const active = color.name === currentColor?.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  aria-label={color.name}
                  aria-pressed={active}
                  onClick={() => setSelected(color.name)}
                  className={`flex size-10 cursor-pointer items-center justify-center rounded-full border p-0.5 transition-colors ${
                    active ? "border-foreground" : "border-border hover:border-foreground"
                  }`}
                >
                  <span className="size-full rounded-full" style={{ backgroundColor: color.hex }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Talla
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.variants.map((variant) => {
              const available = isSizeAvailable(variant);
              const active = variant.size === size;
              return (
                <button
                  key={variant.size}
                  type="button"
                  disabled={!available}
                  aria-pressed={active}
                  onClick={() => setSize(variant.size)}
                  title={available ? `${variant.stock} en stock` : "Sin stock"}
                  className={`py-3 text-sm font-semibold uppercase transition-all border ${
                    !available
                      ? "cursor-not-allowed border-border text-muted-foreground opacity-50"
                      : !active
                        ? "border-border text-foreground hover:border-foreground hover:bg-muted"
                        : "border-foreground bg-foreground text-background"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Button
          type="button"
          size="lg"
          disabled={activeStock === 0}
          className="group flex h-auto w-full justify-center gap-3 rounded-none py-5 text-sm font-semibold uppercase tracking-widest"
        >
          <span>{activeStock === 0 ? "Sin stock" : `Agregar al Carrito`}</span>
          {!(activeStock === 0) && (
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </div>

      <ul className="mb-8 flex flex-col gap-4 border-t border-border pt-8">
        <li className="flex items-start gap-4 text-muted-foreground">
          <Truck className="size-6 shrink-0 text-muted-foreground" />
          <div>
            <p className="mb-1 text-sm font-semibold uppercase text-foreground">
              Envío Gratis
            </p>
            <p className="text-xs">En todos los pedidos mayores a $99. Entrega estándar en 3-5 días hábiles.</p>
          </div>
        </li>
        <li className="flex items-start gap-4 text-muted-foreground">
          <RotateCcw className="size-6 shrink-0 text-muted-foreground" />
          <div>
            <p className="mb-1 text-sm font-semibold uppercase text-foreground">
              Devoluciones en 14 Días
            </p>
            <p className="text-xs">Proceso de devolución fácil. Las prendas deben estar sin usar y sin lavar.</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
