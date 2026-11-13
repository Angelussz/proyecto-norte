import Image from "next/image";
import type { AdminOrderItem } from "@/features/admin-orders/types/admin-order.interface";
import { formatPrice } from "@/lib/products";
import { Package, Tag } from "lucide-react";

interface OrderItemsCardProps {
  items: AdminOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export function OrderItemsCard({ items, subtotal, shippingCost, total }: OrderItemsCardProps) {
  return (
    <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span>Productos del Pedido ({items.length})</span>
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Liquidación de ítems
        </span>
      </div>

      {/* Lista de Prendas */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const imageUrl = item.variant?.image_url || item.variant?.product?.image_url || null;

          return (
            <div
              key={item.id}
              className="border border-border/70 bg-background p-3 flex gap-3.5 items-center transition-colors hover:border-border"
            >
              {/* Thumbnail 1:1 */}
              <div className="size-20 shrink-0 border border-border bg-muted/40 relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.product_name_snapshot}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <Package className="size-6 text-muted-foreground/50" />
                )}
              </div>

              {/* Información del Ítem */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground truncate uppercase tracking-tight">
                    {item.product_name_snapshot}
                  </h4>
                  <span className="text-xs font-bold text-foreground shrink-0">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>

                <p className="text-[10px] font-mono uppercase text-muted-foreground mt-0.5">
                  SKU: {item.sku_snapshot}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-border/40">
                  <span className="inline-flex items-center gap-1 border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    <Tag className="size-2.5" />
                    <span>
                      Talle: {item.variant?.size || "U"} · Color:{" "}
                      {item.variant?.color || "Estándar"}
                    </span>
                  </span>

                  <span className="text-[11px] font-bold text-foreground">
                    {item.quantity} {item.quantity === 1 ? "UNID." : "UNIDS."}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      ({formatPrice(item.unit_price)} c/u)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desglose Económico Ledger */}
      <div className="border border-border bg-muted/30 p-4 flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-medium">
          <span>Subtotal de ítems</span>
          <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-medium">
          <span>Costo de Envío</span>
          <span
            className={
              shippingCost === 0 ? "text-secondary font-bold" : "text-foreground font-semibold"
            }
          >
            {shippingCost === 0 ? "GRATIS ($0.00)" : formatPrice(shippingCost)}
          </span>
        </div>

        <div className="h-px bg-border my-1" />

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs uppercase tracking-wider font-bold text-foreground">
            TOTAL CONSOLIDADO
          </span>
          <span
            className="text-2xl font-bold tracking-tight text-primary"
            style={{ fontFamily: "var(--font-headline), sans-serif" }}
          >
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
