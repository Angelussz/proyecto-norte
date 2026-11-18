"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2, Ban } from "lucide-react";
import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";
import {
  VALID_ORDER_TRANSITIONS,
  isRollbackTransition,
  isTerminalStatus,
} from "@/features/admin-orders/types/admin-order.interface";
import {
  OrderStatusBadge,
  ORDER_STATUS_CONFIG,
} from "@/features/admin-orders/components/order-status-badge";

interface OrderStatusDropdownProps {
  currentStatus: OrderStatus;
  isLoading?: boolean;
  onAdvanceStatus: (nextStatus: OrderStatus) => Promise<void> | void;
  onRequestActionDialog: (type: "CANCEL" | "ROLLBACK", targetStatus?: OrderStatus) => void;
}

export function OrderStatusDropdown({
  currentStatus,
  isLoading = false,
  onAdvanceStatus,
  onRequestActionDialog,
}: OrderStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const allowedTransitions = VALID_ORDER_TRANSITIONS[currentStatus] ?? [];
  const isTerminal = isTerminalStatus(currentStatus);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Si el estado es terminal, no hay opciones disponibles
  if (isTerminal || allowedTransitions.length === 0) {
    return <OrderStatusBadge status={currentStatus} />;
  }

  async function handleOptionClick(targetStatus: OrderStatus) {
    setOpen(false);

    // Si es cancelación, se requiere modal de confirmación y motivo
    if (targetStatus === "CANCELLED") {
      onRequestActionDialog("CANCEL");
      return;
    }

    // Si es retroceso (ej. SHIPPED -> PREPARING), se requiere motivo
    if (isRollbackTransition(currentStatus, targetStatus)) {
      onRequestActionDialog("ROLLBACK", targetStatus);
      return;
    }

    // Si es avance normal
    await onAdvanceStatus(targetStatus);
  }

  const currentConfig = ORDER_STATUS_CONFIG[currentStatus];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} hover:opacity-90`}
      >
        {isLoading ? (
          <Loader2 className="size-3 animate-spin shrink-0" />
        ) : (
          <span
            className={`size-1.5 rounded-full shrink-0 ${currentConfig.dot} ${
              currentStatus === "PREPARING" ? "animate-pulse" : ""
            }`}
          />
        )}
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={`size-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menú desplegable */}
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-48 border border-border bg-card p-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="border-b border-border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Transiciones Válidas
          </div>

          <div className="py-1">
            {allowedTransitions.map((nextStatus) => {
              const config = ORDER_STATUS_CONFIG[nextStatus];
              const isCancelAction = nextStatus === "CANCELLED";
              const isRollback = isRollbackTransition(currentStatus, nextStatus);

              return (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => handleOptionClick(nextStatus)}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs uppercase tracking-wider transition-colors ${
                    isCancelAction
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full shrink-0 ${config.dot}`} />
                    <span>{config.label}</span>
                  </div>
                  {isCancelAction ? (
                    <Ban className="size-3 text-destructive" />
                  ) : isRollback ? (
                    <span className="text-[10px] text-muted-foreground">(Motivo)</span>
                  ) : (
                    <Check className="size-3 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
