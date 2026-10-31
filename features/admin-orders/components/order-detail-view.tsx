"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminOrderDetail } from "@/features/admin-orders/hooks/useAdminOrderDetail";
import {
  useUpdateOrderStatus,
  useCancelOrder,
} from "@/features/admin-orders/hooks/useAdminOrderMutations";
import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";
import { isTerminalStatus } from "@/features/admin-orders/types/admin-order.interface";
import { OrderStepper } from "@/features/admin-orders/components/order-stepper";
import { OrderItemsCard } from "@/features/admin-orders/components/order-items-card";
import { OrderCustomerCard } from "@/features/admin-orders/components/order-customer-card";
import { OrderStatusDropdown } from "@/features/admin-orders/components/order-status-dropdown";
import {
  OrderActionDialog,
  type ActionDialogType,
} from "@/features/admin-orders/components/order-action-dialog";
import { ArrowLeft, Calendar, AlertCircle, Copy, Check, Ban, Radio } from "lucide-react";

interface AdminOrderDetailViewProps {
  orderId: string;
}

export function AdminOrderDetailView({ orderId }: AdminOrderDetailViewProps) {
  const { order, isLoading, isError, error } = useAdminOrderDetail(orderId);
  const updateMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();

  const [copiedId, setCopiedId] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    actionType: ActionDialogType;
    targetStatus?: OrderStatus;
  }>({
    open: false,
    actionType: "CANCEL",
  });

  function handleCopyUuid() {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  async function handleAdvanceStatus(nextStatus: OrderStatus) {
    if (!order) return;
    setBannerAlert(null);
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        dto: {
          status: nextStatus,
          expectedUpdatedAt: order.updated_at,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBannerAlert(err.message);
      }
    }
  }

  function handleRequestActionDialog(type: ActionDialogType, targetStatus?: OrderStatus) {
    setBannerAlert(null);
    setDialogState({
      open: true,
      actionType: type,
      targetStatus,
    });
  }

  async function handleConfirmDialog({
    reason,
    restoreStock,
  }: {
    reason: string;
    restoreStock?: boolean;
  }) {
    if (!order) return;

    if (dialogState.actionType === "CANCEL") {
      await cancelMutation.mutateAsync({
        id: order.id,
        dto: {
          reason,
          expectedUpdatedAt: order.updated_at,
          restoreStock,
        },
      });
    } else if (dialogState.actionType === "ROLLBACK" && dialogState.targetStatus) {
      await updateMutation.mutateAsync({
        id: order.id,
        dto: {
          status: dialogState.targetStatus,
          expectedUpdatedAt: order.updated_at,
          reason,
        },
      });
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 md:px-8">
        <div className="h-8 w-48 animate-pulse bg-muted/60" />
        <div className="h-28 w-full animate-pulse bg-muted/40" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 h-96 animate-pulse bg-muted/30" />
          <div className="md:col-span-5 h-96 animate-pulse bg-muted/30" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 pt-16 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
          Orden no encontrada
        </h2>
        <p className="text-xs text-muted-foreground max-w-md">
          {error?.message || "No se pudo cargar la información operativa del pedido especificado."}
        </p>
        <Link
          href="/admin/orders"
          className="mt-2 border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
        >
          Volver a la bandeja
        </Link>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8);
  const dateFormatted = new Date(order.created_at).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isTerminal = isTerminalStatus(order.status);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 md:px-8">
      {/* ─── Botón Volver ───────────────────────────────────────────────── */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al listado de órdenes</span>
        </Link>
      </div>

      {/* ─── Banner de Alerta / Conflicto ───────────────────────────────── */}
      {bannerAlert && (
        <div className="flex items-center justify-between gap-3 border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{bannerAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerAlert(null)}
            className="font-bold underline uppercase text-[10px]"
          >
            Entendido
          </button>
        </div>
      )}

      {/* ─── Cabecera Principal de la Orden ─────────────────────────────── */}
      <div className="border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground uppercase"
                style={{ fontFamily: "var(--font-headline), sans-serif" }}
              >
                ORDEN #ORD-{shortId}
              </h1>
              <button
                type="button"
                onClick={handleCopyUuid}
                title="Copiar ID completo"
                className="flex items-center gap-1 border border-border bg-background px-2 py-0.5 text-[10px] uppercase font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedId ? (
                  <Check className="size-3 text-secondary" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>{copiedId ? "Copiado" : "UUID"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="size-3.5" />
              <span>{dateFormatted}</span>
            </div>
          </div>

          {/* Selector de Estado en Cabecera */}
          <div className="flex items-center gap-3">
            <OrderStatusDropdown
              currentStatus={order.status}
              isLoading={updateMutation.isPending || cancelMutation.isPending}
              onAdvanceStatus={handleAdvanceStatus}
              onRequestActionDialog={handleRequestActionDialog}
            />
          </div>
        </div>

        {/* Fila secundaria de metadatos */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-1.5 font-medium">
            <Radio className="size-3 text-secondary animate-pulse" />
            <span>Canal: E-Commerce / Flagship Store</span>
          </div>

          {!isTerminal && (
            <button
              type="button"
              onClick={() => handleRequestActionDialog("CANCEL")}
              className="flex items-center gap-1 text-destructive hover:opacity-80 font-bold transition-opacity"
            >
              <Ban className="size-3.5" />
              <span>Cancelar orden</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Stepper Logístico / Banners de Auditoría ───────────────────── */}
      <OrderStepper
        status={order.status}
        cancelReason={order.cancel_reason}
        statusNotes={order.status_notes}
      />

      {/* ─── Grilla Editorial Principal (7 columnas / 5 columnas) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Ítems y Desglose Liquidado */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <OrderItemsCard
            items={order.items}
            subtotal={order.subtotal}
            shippingCost={order.shipping_cost}
            total={order.total}
          />
        </div>

        {/* Columna Derecha: Cliente, Dirección, Pago y Fiscal */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <OrderCustomerCard
            customer={order.user}
            address={order.address}
            payment={order.payment}
            fiscalReceipt={order.fiscal_receipt}
          />
        </div>
      </div>

      {/* ─── Modal de Acción ────────────────────────────────────────────── */}
      <OrderActionDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        orderId={order.id}
        orderShortId={shortId}
        currentStatus={order.status}
        targetStatus={dialogState.targetStatus}
        actionType={dialogState.actionType}
        isLoading={updateMutation.isPending || cancelMutation.isPending}
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
