"use client";

import { useState, type FormEvent } from "react";
import { X, ExternalLink } from "lucide-react";

import { useAdminOrderDetail } from "@/features/admin-orders/hooks/useAdminOrderDetail";
import { useAdminRefund } from "@/features/admin-payments/hooks/useAdminRefund";
import type { AdminPayment } from "@/features/admin-payments/types/admin-payment.interface";

interface PaymentDetailDialogProps {
  payment: AdminPayment | null;
  onClose: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "No disponible";

  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRefundStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "En proceso",
    SUCCEEDED: "Completado",
    FAILED: "Fallido",
    REQUIRES_REVIEW: "Requiere revisión",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function PaymentDetailDialog({ payment, onClose }: PaymentDetailDialogProps) {
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMessage, setRefundMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    order: orderDetail,
    isLoading: isLoadingOrderDetail,
    isError: isOrderDetailError,
  } = useAdminOrderDetail(payment?.order_id ?? "");

  const refundMutation = useAdminRefund();

  if (!payment) return null;

  // Guardamos el ID después de comprobar que payment no es null.
  // Así también podemos utilizarlo dentro de la función asíncrona.
  const orderId = payment.order_id;

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  };

  const methodLabels: Record<string, string> = {
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    CASH_ON_DELIVERY: "Contra entrega",
  };

  const refunds = orderDetail?.payment?.refunds ?? [];

  const reservedStatuses = ["PENDING", "PROCESSING", "SUCCEEDED", "REQUIRES_REVIEW"];

  const reservedAmount = refunds
    .filter((refund) => reservedStatuses.includes(refund.status))
    .reduce((sum, refund) => sum + Number(refund.amount), 0);

  const availableAmount = Math.max(0, Math.round((payment.amount - reservedAmount) * 100) / 100);

  const canRefund =
    payment.status === "APPROVED" &&
    payment.gateway === "STRIPE" &&
    Boolean(payment.gateway_transaction_id?.startsWith("pi_")) &&
    availableAmount > 0;

  async function handleRefundSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRefundMessage(null);

    const reason = refundReason.trim();

    if (!reason) {
      setRefundMessage({
        type: "error",
        text: "Ingresá el motivo del reembolso.",
      });
      return;
    }

    if (reason.length > 500) {
      setRefundMessage({
        type: "error",
        text: "El motivo no puede superar los 500 caracteres.",
      });
      return;
    }

    const parsedAmount = refundAmount.trim() === "" ? undefined : Number(refundAmount);

    if (
      parsedAmount !== undefined &&
      (!Number.isFinite(parsedAmount) ||
        parsedAmount <= 0 ||
        Math.round(parsedAmount * 100) !== parsedAmount * 100)
    ) {
      setRefundMessage({
        type: "error",
        text: "Ingresá un importe positivo con hasta dos decimales.",
      });
      return;
    }

    if (parsedAmount !== undefined && parsedAmount > availableAmount) {
      setRefundMessage({
        type: "error",
        text: `El importe no puede superar ${formatCurrency(availableAmount)}.`,
      });
      return;
    }

    try {
      const result = await refundMutation.mutateAsync({
        orderId,
        dto: {
          reason,
          ...(parsedAmount !== undefined ? { amount: parsedAmount } : {}),
        },
        idempotencyKey: crypto.randomUUID(),
      });

      const status = result.refund.status;

      let text: string;

      if (result.requires_review || status === "REQUIRES_REVIEW") {
        text = "La solicitud requiere revisión manual.";
      } else if (status === "PROCESSING" || status === "PENDING") {
        text = "El reembolso fue solicitado y está en proceso.";
      } else if (status === "SUCCEEDED") {
        text = "El reembolso se completó correctamente.";
      } else {
        text = `La solicitud quedó en estado: ${formatRefundStatus(status)}.`;
      }

      if (result.repeated_request) {
        text += " Se recuperó una solicitud anterior.";
      }

      setRefundMessage({ type: "success", text });
      setRefundReason("");
      setRefundAmount("");
    } catch (error) {
      setRefundMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo solicitar el reembolso.",
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-xl"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
          <div>
            <h2
              id="payment-detail-title"
              className="text-sm font-bold uppercase tracking-wider text-foreground"
            >
              Detalle del pago
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">ID: {payment.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex size-8 items-center justify-center border border-border text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-border p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Importe
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                {formatCurrency(payment.amount)}
              </p>
            </div>

            <div className="border border-border p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Estado
              </p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {statusLabels[payment.status] ?? payment.status}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Información del pago
            </h3>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] text-muted-foreground">Método de pago</dt>
                <dd className="mt-1 text-xs text-foreground">
                  {methodLabels[payment.payment_method] ?? payment.payment_method}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] text-muted-foreground">Pasarela</dt>
                <dd className="mt-1 text-xs text-foreground">
                  {payment.gateway.replaceAll("_", " ")}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] text-muted-foreground">Transacción</dt>
                <dd className="mt-1 break-all text-xs text-foreground">
                  {payment.gateway_transaction_id ?? "No disponible"}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] text-muted-foreground">Fecha de creación</dt>
                <dd className="mt-1 text-xs text-foreground">{formatDate(payment.created_at)}</dd>
              </div>

              <div>
                <dt className="text-[10px] text-muted-foreground">Fecha de aprobación</dt>
                <dd className="mt-1 text-xs text-foreground">{formatDate(payment.paid_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Información del pedido
            </h3>
            <p className="text-xs text-foreground">Pedido: {payment.order.id}</p>
            <p className="mt-1 text-xs text-muted-foreground">Estado: {payment.order.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total del pedido: {formatCurrency(payment.order.total)}
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Cliente
            </h3>
            <p className="text-xs font-medium text-foreground">
              {payment.order.user.name} {payment.order.user.last_name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{payment.order.user.email}</p>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Historial de reembolsos
            </h3>

            {isLoadingOrderDetail && (
              <p className="text-xs text-muted-foreground">Cargando historial de reembolsos...</p>
            )}

            {isOrderDetailError && (
              <p className="text-xs text-red-600">No se pudo cargar el historial de reembolsos.</p>
            )}

            {!isLoadingOrderDetail && !isOrderDetailError && refunds.length === 0 && (
              <p className="border border-border p-3 text-xs text-muted-foreground">
                Este pago todavía no tiene reembolsos registrados.
              </p>
            )}

            {!isLoadingOrderDetail && !isOrderDetailError && refunds.length > 0 && (
              <div className="space-y-3">
                {refunds.map((refund) => (
                  <div key={refund.id} className="border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(refund.amount)}
                      </p>
                      <span className="border border-border px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        {formatRefundStatus(refund.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Motivo: {refund.reason ?? "No especificado"}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Fecha: {formatDate(refund.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Solicitar reembolso
            </h3>

            {canRefund ? (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Saldo disponible: {formatCurrency(availableAmount)}. Dejá el importe vacío para
                  solicitar el saldo completo.
                </p>

                <form onSubmit={handleRefundSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="refund-reason"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Motivo
                    </label>
                    <textarea
                      id="refund-reason"
                      value={refundReason}
                      onChange={(event) => setRefundReason(event.target.value)}
                      maxLength={500}
                      required
                      rows={3}
                      placeholder="Explicá el motivo del reembolso"
                      className="w-full border border-border bg-background p-2 text-xs text-foreground"
                    />
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">
                      {refundReason.length}/500
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="refund-amount"
                      className="mb-1 block text-xs font-medium text-foreground"
                    >
                      Importe (opcional)
                    </label>
                    <input
                      id="refund-amount"
                      type="number"
                      min="0.01"
                      max={availableAmount}
                      step="0.01"
                      value={refundAmount}
                      onChange={(event) => setRefundAmount(event.target.value)}
                      placeholder={`Hasta ${formatCurrency(availableAmount)}`}
                      className="w-full border border-border bg-background p-2 text-xs text-foreground"
                    />
                  </div>

                  {refundMessage && (
                    <p
                      role="status"
                      className={`border p-3 text-xs ${
                        refundMessage.type === "success"
                          ? "border-green-600/30 bg-green-600/5 text-green-700"
                          : "border-red-500/30 bg-red-500/5 text-red-600"
                      }`}
                    >
                      {refundMessage.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={refundMutation.isPending}
                    className="h-9 border border-border px-4 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {refundMutation.isPending ? "Procesando solicitud..." : "Solicitar reembolso"}
                  </button>
                </form>
              </>
            ) : (
              <p className="border border-border p-3 text-xs text-muted-foreground">
                {payment.status !== "APPROVED"
                  ? "Solo se pueden reembolsar pagos aprobados."
                  : payment.gateway !== "STRIPE" ||
                      !payment.gateway_transaction_id?.startsWith("pi_")
                    ? "Este pago no es elegible para reembolso automático por Stripe."
                    : "No hay saldo disponible para reembolsar."}
              </p>
            )}
          </div>

          {payment.rejection_reason && (
            <div className="border border-red-500/30 bg-red-500/5 p-3">
              <h3 className="text-xs font-bold text-red-600">Motivo del rechazo</h3>
              <p className="mt-1 text-xs text-foreground">{payment.rejection_reason}</p>
            </div>
          )}

          {payment.voucher_url && (
            <div className="border-t border-border pt-4">
              <a
                href={payment.voucher_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
              >
                Ver comprobante
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 border border-border px-4 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted"
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
