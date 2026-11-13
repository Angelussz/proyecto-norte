"use client";

import { Search, RotateCcw, Download, RefreshCw } from "lucide-react";

import type {
  AdminPaymentFilters,
  AdminPayment,
  AdminPaymentMethod,
  AdminPaymentStatus,
} from "@/features/admin-payments/types/admin-payment.interface";

interface PaymentsFiltersBarProps {
  filters: AdminPaymentFilters;
  onFilterChange: (newFilters: Partial<AdminPaymentFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFetching?: boolean;
  paymentsForExport?: AdminPayment[];
}

export function PaymentsFiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFetching = false,
  paymentsForExport = [],
}: PaymentsFiltersBarProps) {
  function handleExportCsv() {
    if (!paymentsForExport.length) return;

    const headers = [
      "ID de pago",
      "ID de pedido",
      "Fecha",
      "Cliente",
      "Email",
      "Método",
      "Pasarela",
      "Importe",
      "Estado",
    ];

    const rows = paymentsForExport.map((payment) => [
      payment.id,
      payment.order_id,
      new Date(payment.created_at).toLocaleString("es-AR"),
      `"${payment.order.user.name} ${payment.order.user.last_name}"`,
      payment.order.user.email,
      payment.payment_method,
      payment.gateway,
      payment.amount.toFixed(2),
      payment.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `norte-pagos-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
    (filters.status && filters.status !== "ALL") ||
    (filters.method && filters.method !== "ALL") ||
    filters.from ||
    filters.to,
  );

  return (
    <div className="border border-border bg-card p-3 shadow-xs flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="size-4" />
          </div>

          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Buscar por pago, pedido, cliente o email..."
            className="w-full h-9 pl-9 pr-3 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refrescar datos"
            className="h-9 px-3 border border-border bg-background text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:bg-muted flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!paymentsForExport.length}
            className="h-9 px-3.5 border border-border bg-background text-foreground text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Download className="size-3.5 text-primary" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
        <div className="flex-1 min-w-[140px] sm:max-w-xs">
          <select
            value={filters.status ?? "ALL"}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value as AdminPaymentStatus | "ALL",
                page: 1,
              })
            }
            className="w-full h-8 px-2.5 bg-background border border-border text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="APPROVED">Aprobados</option>
            <option value="REJECTED">Rechazados</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px] sm:max-w-xs">
          <select
            value={filters.method ?? "ALL"}
            onChange={(e) =>
              onFilterChange({
                method: e.target.value as AdminPaymentMethod | "ALL",
                page: 1,
              })
            }
            className="w-full h-8 px-2.5 bg-background border border-border text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Todos los métodos</option>
            <option value="CARD">Tarjeta</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CASH_ON_DELIVERY">Contra entrega</option>
          </select>
        </div>

        <div className="flex-1 min-w-[130px]">
          <input
            type="date"
            aria-label="Fecha desde"
            value={filters.from ?? ""}
            onChange={(e) =>
              onFilterChange({
                from: e.target.value || undefined,
                page: 1,
              })
            }
            className="w-full h-8 px-2 bg-background border border-border text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex-1 min-w-[130px]">
          <input
            type="date"
            aria-label="Fecha hasta"
            value={filters.to ?? ""}
            min={filters.from}
            onChange={(e) =>
              onFilterChange({
                to: e.target.value || undefined,
                page: 1,
              })
            }
            className="w-full h-8 px-2 bg-background border border-border text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-8 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
