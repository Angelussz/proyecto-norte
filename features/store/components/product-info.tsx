"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Truck } from "lucide-react";
import { formatPrice, isSizeAvailable } from "@/lib/products";
import type { ProductDetail } from "@/features/product/types/product.interface";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/hooks";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addItem } = useCart();

  const firstAvailableVariant = useMemo(
    () => product.variants.find((variant) => isSizeAvailable(variant)) ?? product.variants[0],
    [product.variants],
  );

  const [size, setSize] = useState(firstAvailableVariant?.size ?? "");
  const [selected, setSelected] = useState(
    firstAvailableVariant?.color ?? product.colors[0]?.name ?? "",
  );
  const [showAdded, setShowAdded] = useState(false);

  const currentColor = product.colors.find((color) => color.name === selected) ?? product.colors[0];

  const variantsForColor = product.variants.filter((variant) => variant.color === selected);

  const activeVariant = variantsForColor.find((variant) => variant.size === size);

  const activeStock = activeVariant?.stock ?? 0;

  const handleAddToCart = () => {
    if (!activeVariant || activeStock <= 0) return;

    addItem({
      id: activeVariant.id,
      name: product.name,
      color: activeVariant.color,
      size: activeVariant.size,
      price: activeVariant.price,
      imageUrl: product.images[0] || "",
      quantity: 1,
    });

    setShowAdded(true);
  };

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
          {formatPrice(activeVariant?.price ?? product.price)}
        </p>

        <p className="leading-relaxed text-muted-foreground">{product.description}</p>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
            Color:{" "}
            <span className="font-normal text-muted-foreground">
              {currentColor?.name ?? "No disponible"}
            </span>
          </span>
        </div>

        <div className="flex gap-3">
          {product.colors.map((color) => {
            const active = color.name === selected;

            return (
              <button
                key={color.name}
                type="button"
                aria-label={color.name}
                aria-pressed={active}
                onClick={() => {
                  setSelected(color.name);

                  const nextVariant =
                    product.variants.find(
                      (variant) => variant.color === color.name && variant.stock > 0,
                    ) ?? product.variants.find((variant) => variant.color === color.name);

                  setSize(nextVariant?.size ?? "");
                }}
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

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
            Talla
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {variantsForColor.map((variant) => {
            const available = isSizeAvailable(variant);
            const active = variant.size === size;

            return (
              <button
                key={variant.id}
                type="button"
                disabled={!available}
                aria-pressed={active}
                onClick={() => setSize(variant.size)}
                title={available ? `${variant.stock} en stock` : "Sin stock"}
                className={`border py-3 text-sm font-semibold uppercase transition-all ${
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

      <div className="mb-8">
        <Button
          type="button"
          size="lg"
          disabled={!activeVariant || activeStock <= 0}
          onClick={handleAddToCart}
          className="group flex h-auto w-full justify-center gap-3 rounded-none py-5 text-sm font-semibold uppercase tracking-widest"
        >
          <span>{!activeVariant || activeStock <= 0 ? "Sin stock" : "Agregar al Carrito"}</span>

          {activeVariant && activeStock > 0 && (
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </div>

      <ul className="mb-8 flex flex-col gap-4 border-t border-border pt-8">
        <li className="flex items-start gap-4 text-muted-foreground">
          <Truck className="size-6 shrink-0 text-muted-foreground" />

          <div>
            <p className="mb-1 text-sm font-semibold uppercase text-foreground">Envío Gratis</p>

            <p className="text-xs">
              En todos los pedidos mayores a $99. Entrega estándar en 3-5 días hábiles.
            </p>
          </div>
        </li>

        <li className="flex items-start gap-4 text-muted-foreground">
          <RotateCcw className="size-6 shrink-0 text-muted-foreground" />

          <div>
            <p className="mb-1 text-sm font-semibold uppercase text-foreground">
              Devoluciones en 14 Días
            </p>

            <p className="text-xs">
              Proceso de devolución fácil. Las prendas deben estar sin usar y sin lavar.
            </p>
          </div>
        </li>
      </ul>

      {showAdded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-background p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Producto agregado al carrito</h2>

            <p className="mt-2 text-muted-foreground">{product.name}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setShowAdded(false)}>
                Seguir comprando
              </Button>

              <Button type="button" onClick={() => router.push("/cart")}>
                Ir al carrito
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
