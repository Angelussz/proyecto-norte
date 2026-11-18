import { useMemo } from "react";
import type { AdminOrderSummary } from "@/features/admin-orders/types/admin-order.interface";
import { formatPrice } from "@/lib/products";
import { Package, Truck, DollarSign } from "lucide-react";

interface OrdersMetricsStripProps {
  orders: AdminOrderSummary[];
  totalCount?: number;
}

export function OrdersMetricsStrip({ orders, totalCount }: OrdersMetricsStripProps) {
  const metrics = useMemo(() => {
    const totalAmount = orders.reduce((acc, curr) => acc + curr.total, 0);

    const inRouteCount = orders.filter(
      (o) => o.status === "PREPARING" || o.status === "SHIPPED",
    ).length;

    const paidOrPending = orders.filter(
      (o) => o.status === "PAID" || o.status === "PENDING_PAYMENT",
    ).length;

    return {
      totalAmount,
      inRouteCount,
      paidOrPending,
      displayedCount: orders.length,
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Métrica 1: Volumen / Total */}
      <div className="border border-border bg-card p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
            Pedidos Filtrados
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-headline), sans-serif" }}
            >
              {totalCount !== undefined ? totalCount : metrics.displayedCount}
            </span>
            <span className="text-xs text-muted-foreground lowercase">órdenes</span>
          </div>
        </div>
        <div className="flex size-9 items-center justify-center border border-border bg-background text-muted-foreground">
          <Package className="size-4" />
        </div>
      </div>

      {/* Métrica 2: En Proceso / Logística */}
      <div className="border border-border bg-card p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
            En Ruta / Preparación
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold tracking-tight text-secondary"
              style={{ fontFamily: "var(--font-headline), sans-serif" }}
            >
              {String(metrics.inRouteCount).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground lowercase">paquetes</span>
          </div>
        </div>
        <div className="flex size-9 items-center justify-center border border-secondary/30 bg-secondary/10 text-secondary">
          <Truck className="size-4" />
        </div>
      </div>

      {/* Métrica 3: Monto Liquidado */}
      <div className="border border-border bg-card p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block">
            Volumen Total Página
          </span>
          <div className="mt-1">
            <span
              className="text-2xl font-bold tracking-tight text-primary"
              style={{ fontFamily: "var(--font-headline), sans-serif" }}
            >
              {formatPrice(metrics.totalAmount)}
            </span>
          </div>
        </div>
        <div className="flex size-9 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
          <DollarSign className="size-4" />
        </div>
      </div>
    </div>
  );
}
