"use client";

import Link from "next/link";
import type {
  AdminOrderPagination,
  AdminOrderSummary,
  OrderStatus,
} from "@/features/admin-orders/types/admin-order.interface";
import { formatPrice } from "@/lib/products";
import { OrderStatusDropdown } from "@/features/admin-orders/components/order-status-dropdown";
import { ChevronLeft, ChevronRight, ArrowRight, Inbox, Calendar } from "lucide-react";

interface OrdersTableProps {
  orders: AdminOrderSummary[];
  pagination?: AdminOrderPagination;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onAdvanceStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    expectedUpdatedAt: string,
  ) => Promise<void> | void;
  onRequestActionDialog: (
    order: AdminOrderSummary,
    type: "CANCEL" | "ROLLBACK",
    targetStatus?: OrderStatus,
  ) => void;
  onResetFilters: () => void;
}

export function OrdersTable({
  orders,
  pagination,
  isLoading = false,
  onPageChange,
  onAdvanceStatus,
  onRequestActionDialog,
  onResetFilters,
}: OrdersTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border bg-card p-6 flex flex-col gap-3 shadow-xs">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse border border-border/50 bg-muted/40" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="flex size-12 items-center justify-center border border-border bg-muted/50 text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            No se encontraron pedidos
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Prueba ajustando los filtros de búsqueda o el estado seleccionado.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-2 border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
        >
          Limpiar todos los filtros
        </button>
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? orders.length;

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Encabezado para Escritorio ─────────────────────────────────── */}
      <div className="hidden lg:grid grid-cols-12 px-4 py-2.5 bg-muted/70 text-muted-foreground text-[11px] font-semibold uppercase tracking-widest border border-border select-none">
        <div className="col-span-3">ORDEN / FECHA</div>
        <div className="col-span-3">CLIENTE</div>
        <div className="col-span-2 text-right">TOTAL</div>
        <div className="col-span-3 text-center">ESTADO / OPERACIÓN</div>
        <div className="col-span-1 text-right">ACCIÓN</div>
      </div>

      {/* ─── Lista de Filas / Tarjetas ──────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {orders.map((order) => {
          const shortId = order.id.slice(0, 8);
          const dateFormatted = new Date(order.created_at).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <article
              key={order.id}
              className="border border-border bg-card p-4 transition-colors hover:border-primary/40 shadow-xs flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:items-center lg:gap-2"
            >
              {/* Columna 1: ID y Fecha */}
              <div className="lg:col-span-3 flex items-start justify-between lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-foreground uppercase">
                    #ORD-{shortId}
                  </span>
                  {order.cancel_reason && (
                    <span className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.2 uppercase font-medium">
                      Anulada
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Calendar className="size-3" />
                  <span>{dateFormatted}</span>
                </div>
              </div>

              {/* Columna 2: Cliente */}
              <div className="lg:col-span-3 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {order.user.name} {order.user.last_name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{order.user.email}</p>
                <p className="text-[10px] text-muted-foreground/80">{order.user.phone}</p>
              </div>

              {/* Columna 3: Total */}
              <div className="lg:col-span-2 flex items-baseline justify-between lg:block lg:text-right">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase lg:hidden">
                  Total:
                </span>
                <div>
                  <div className="text-sm font-bold tracking-tight text-foreground">
                    {formatPrice(order.total)}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {order.items_count} {order.items_count === 1 ? "ítem" : "ítems"}
                  </span>
                </div>
              </div>

              {/* Columna 4: Estado y Dropdown Interactivo */}
              <div className="lg:col-span-3 flex items-center justify-between lg:justify-center border-t border-border/40 pt-2 lg:border-t-0 lg:pt-0">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase lg:hidden">
                  Estado:
                </span>
                <OrderStatusDropdown
                  currentStatus={order.status}
                  onAdvanceStatus={(nextStatus) =>
                    onAdvanceStatus(order.id, nextStatus, order.updated_at)
                  }
                  onRequestActionDialog={(type, targetStatus) =>
                    onRequestActionDialog(order, type, targetStatus)
                  }
                />
              </div>

              {/* Columna 5: Acción Ver Detalle */}
              <div className="lg:col-span-1 flex justify-end">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-1 border border-border bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <span className="hidden xl:inline">Ver</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── Paginación ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-2 border border-border bg-card px-4 py-3 flex items-center justify-between shadow-xs text-xs text-muted-foreground">
          <div>
            Mostrando página <span className="font-semibold text-foreground">{currentPage}</span> de{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems}{" "}
            pedidos)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex items-center gap-1 border border-border bg-background px-3 py-1.5 font-semibold uppercase tracking-wider text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex items-center gap-1 border border-border bg-background px-3 py-1.5 font-semibold uppercase tracking-wider text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
