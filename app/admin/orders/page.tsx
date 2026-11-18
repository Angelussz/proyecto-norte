"use client";

import { useState } from "react";
import { useAdminOrders } from "@/features/admin-orders/hooks/useAdminOrders";
import {
  useUpdateOrderStatus,
  useCancelOrder,
} from "@/features/admin-orders/hooks/useAdminOrderMutations";
import type {
  AdminOrderFilters,
  AdminOrderSummary,
  OrderStatus,
} from "@/features/admin-orders/types/admin-order.interface";
import { OrdersMetricsStrip } from "@/features/admin-orders/components/orders-metrics-strip";
import { OrdersFiltersBar } from "@/features/admin-orders/components/orders-filters-bar";
import { OrdersTable } from "@/features/admin-orders/components/orders-table";
import {
  OrderActionDialog,
  type ActionDialogType,
} from "@/features/admin-orders/components/order-action-dialog";
import { AlertCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState<AdminOrderFilters>({
    page: 1,
    limit: 10,
    status: "ALL",
  });

  // Estado para el modal de justificación (cancelación o retroceso)
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    order: AdminOrderSummary | null;
    actionType: ActionDialogType;
    targetStatus?: OrderStatus;
  }>({
    open: false,
    order: null,
    actionType: "CANCEL",
  });

  // Mensaje de alerta para conflictos de concurrencia u otros
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Queries y Mutaciones
  const { orders, pagination, isLoading, isFetching, refetch } = useAdminOrders(filters);
  const updateMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();

  function handleFilterChange(newFilters: Partial<AdminOrderFilters>) {
    setBannerAlert(null);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }

  function handleClearFilters() {
    setBannerAlert(null);
    setFilters({
      page: 1,
      limit: 10,
      status: "ALL",
      search: undefined,
      from: undefined,
      to: undefined,
    });
  }

  // Avance directo de estado
  async function handleAdvanceStatus(
    orderId: string,
    nextStatus: OrderStatus,
    expectedUpdatedAt: string,
  ) {
    setBannerAlert(null);
    try {
      await updateMutation.mutateAsync({
        id: orderId,
        dto: {
          status: nextStatus,
          expectedUpdatedAt,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBannerAlert(err.message);
      }
    }
  }

  // Solicitud de diálogo para motivo de retroceso o cancelación
  function handleRequestActionDialog(
    order: AdminOrderSummary,
    type: ActionDialogType,
    targetStatus?: OrderStatus,
  ) {
    setBannerAlert(null);
    setDialogState({
      open: true,
      order,
      actionType: type,
      targetStatus,
    });
  }

  // Confirmación desde el modal
  async function handleConfirmDialog({
    reason,
    restoreStock,
  }: {
    reason: string;
    restoreStock?: boolean;
  }) {
    if (!dialogState.order) return;

    const orderId = dialogState.order.id;
    const expectedUpdatedAt = dialogState.order.updated_at;

    if (dialogState.actionType === "CANCEL") {
      await cancelMutation.mutateAsync({
        id: orderId,
        dto: {
          reason,
          expectedUpdatedAt,
          restoreStock,
        },
      });
    } else if (dialogState.actionType === "ROLLBACK" && dialogState.targetStatus) {
      await updateMutation.mutateAsync({
        id: orderId,
        dto: {
          status: dialogState.targetStatus,
          expectedUpdatedAt,
          reason,
        },
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 md:px-8">
      {/* ─── Encabezado de Página ───────────────────────────────────────── */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1
          className="text-3xl font-normal tracking-[0.22em] text-foreground uppercase"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          ÓRDENES
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Control de despacho, transiciones y auditoría de pedidos
        </p>
      </div>

      {/* Banner de alerta (ej. 409 Conflict) */}
      {bannerAlert && (
        <div className="flex items-center justify-between gap-3 border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{bannerAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerAlert(null)}
            className="font-bold underline uppercase text-[10px]"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ─── Tira de Métricas ───────────────────────────────────────────── */}
      <OrdersMetricsStrip orders={orders} totalCount={pagination?.total} />

      {/* ─── Barra de Filtros y Búsqueda ─────────────────────────────────── */}
      <OrdersFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        ordersForExport={orders}
      />

      {/* ─── Tabla Operativa ────────────────────────────────────────────── */}
      <OrdersTable
        orders={orders}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(page) => handleFilterChange({ page })}
        onAdvanceStatus={handleAdvanceStatus}
        onRequestActionDialog={handleRequestActionDialog}
        onResetFilters={handleClearFilters}
      />

      {/* ─── Modal de Acción (Cancelación / Retroceso con Motivo) ────────── */}
      {dialogState.order && (
        <OrderActionDialog
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
          orderId={dialogState.order.id}
          orderShortId={dialogState.order.id.slice(0, 8)}
          currentStatus={dialogState.order.status}
          targetStatus={dialogState.targetStatus}
          actionType={dialogState.actionType}
          isLoading={updateMutation.isPending || cancelMutation.isPending}
          onConfirm={handleConfirmDialog}
        />
      )}
    </div>
  );
}
