"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Loader2, X, RotateCcw, Ban } from "lucide-react";
import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";
import { shouldDefaultRestoreStock } from "@/features/admin-orders/types/admin-order.interface";

export type ActionDialogType = "CANCEL" | "ROLLBACK";

interface OrderActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderShortId?: string;
  currentStatus: OrderStatus;
  targetStatus?: OrderStatus;
  actionType: ActionDialogType;
  isLoading?: boolean;
  onConfirm: (data: { reason: string; restoreStock?: boolean }) => Promise<void> | void;
}

export function OrderActionDialog({
  open,
  onOpenChange,
  orderId,
  orderShortId,
  currentStatus,
  targetStatus,
  actionType,
  isLoading = false,
  onConfirm,
}: OrderActionDialogProps) {
  const [reason, setReason] = useState("");
  const [restoreStock, setRestoreStock] = useState<boolean>(
    shouldDefaultRestoreStock(currentStatus),
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCancel = actionType === "CANCEL";
  const displayId = orderShortId || orderId.slice(0, 8);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = reason.trim();
    if (!trimmed) {
      setErrorMsg("El motivo es obligatorio para registrar la operación.");
      return;
    }

    try {
      await onConfirm({
        reason: trimmed,
        restoreStock: isCancel ? restoreStock : undefined,
      });
      setReason("");
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Ocurrió un error al procesar la acción.");
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex size-8 shrink-0 items-center justify-center border ${
                  isCancel
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                {isCancel ? <Ban className="size-4" /> : <RotateCcw className="size-4" />}
              </div>
              <div>
                <Dialog.Title className="text-base font-bold uppercase tracking-wider text-foreground">
                  {isCancel ? `Cancelar Pedido #${displayId}` : "Justificar Retroceso"}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  {isCancel
                    ? "Esta acción es terminal e irreversible."
                    : `Cambiar de ${currentStatus} a ${targetStatus || "PREPARING"}.`}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              type="button"
              disabled={isLoading}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Alerta de advertencia */}
            <div className="flex items-start gap-2.5 border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="size-4 shrink-0 text-primary mt-0.5" />
              <p>
                {isCancel
                  ? "Se registrará el motivo en la auditoría fiscal y operativa. Si el pedido ya fue pagado, se cancelará su comprobante."
                  : "Los retrocesos de estado requieren justificación por motivos de control de calidad y trazabilidad logística."}
              </p>
            </div>

            {/* Checkbox de reposición de stock (solo en cancelación) */}
            {isCancel && (
              <label className="flex items-center gap-3 border border-border bg-background p-3 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={restoreStock}
                  onChange={(e) => setRestoreStock(e.target.checked)}
                  disabled={isLoading}
                  className="size-4 accent-primary"
                />
                <span className="flex-1 font-medium">
                  Reintegrar automáticamente las unidades al inventario de almacén
                </span>
              </label>
            )}

            {/* Textarea del motivo */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="action-reason"
                className="text-[11px] font-semibold uppercase tracking-wider text-foreground"
              >
                Motivo obligatorio <span className="text-destructive">*</span>
              </label>
              <textarea
                id="action-reason"
                rows={3}
                required
                disabled={isLoading}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isCancel
                    ? "Ej: Cliente solicitó anulación por error en la talla / Domicilio inalcanzable"
                    : "Ej: Courier reportó que el paquete sufrió un daño en empaque y debe rearmarse"
                }
                className="w-full border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorMsg}
              </p>
            )}

            {/* Botones de acción */}
            <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                className="border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-muted"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isLoading || !reason.trim()}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity disabled:opacity-50 ${
                  isCancel
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isCancel ? "Confirmar Cancelación" : "Confirmar Cambio"}</span>
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
