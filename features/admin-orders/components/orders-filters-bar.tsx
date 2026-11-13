"use client";

import { Search, RotateCcw, Download, RefreshCw } from "lucide-react";
import type {
  AdminOrderFilters,
  AdminOrderSummary,
  OrderStatus,
} from "@/features/admin-orders/types/admin-order.interface";

interface OrdersFiltersBarProps {
  filters: AdminOrderFilters;
  onFilterChange: (newFilters: Partial<AdminOrderFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isFetching?: boolean;
  ordersForExport?: AdminOrderSummary[];
}

export function OrdersFiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isFetching = false,
  ordersForExport = [],
}: OrdersFiltersBarProps) {
  function handleExportCsv() {
    if (!ordersForExport.length) return;

    const headers = ["ID", "Fecha", "Cliente", "Email", "Telefono", "Total", "Estado", "Items"];
    const rows = ordersForExport.map((o) => [
      o.id,
      new Date(o.created_at).toLocaleString("es-PE"),
      `"${o.user.name} ${o.user.last_name}"`,
      o.user.email,
      o.user.phone,
      o.total.toFixed(2),
      o.status,
      o.items_count,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `norte-ordenes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const hasActiveFilters = Boolean(
    filters.search || (filters.status && filters.status !== "ALL") || filters.from || filters.to,
  );

  return (
    <div className="border border-border bg-card p-3 shadow-xs flex flex-col gap-3">
      {/* Fila 1: Buscador y Acciones Generales */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Buscador de texto */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Buscar por ID, nombre del cliente o email..."
            className="w-full h-9 pl-9 pr-3 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Botones de utilidad */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refrescar datos"
            className="h-9 px-3 border border-border bg-background text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:bg-muted flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!ordersForExport.length}
            className="h-9 px-3.5 border border-border bg-background text-foreground text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors hover:bg-muted active:bg-primary active:text-primary-foreground disabled:opacity-50"
          >
            <Download className="size-3.5 text-primary" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Fila 2: Selectores de Estado y Rango de Fechas */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
        {/* Filtro por estado */}
        <div className="flex-1 min-w-[140px] sm:max-w-xs">
          <select
            value={filters.status ?? "ALL"}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value as OrderStatus | "ALL",
                page: 1,
              })
            }
            className="w-full h-8 px-2.5 bg-background border border-border text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PAID">Pagadas</option>
            <option value="PREPARING">En preparación</option>
            <option value="SHIPPED">Enviadas</option>
            <option value="DELIVERED">Entregadas</option>
            <option value="PENDING_PAYMENT">Pendientes de pago</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>

        {/* Filtro por periodo rápido */}
        <div className="flex-1 min-w-[140px] sm:max-w-xs">
          <select
            defaultValue="ALL"
            onChange={(e) => {
              const val = e.target.value;
              const now = new Date();
              if (val === "TODAY") {
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                onFilterChange({ from: today.toISOString(), to: undefined, page: 1 });
              } else if (val === "7D") {
                const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                onFilterChange({ from: last7.toISOString(), to: undefined, page: 1 });
              } else if (val === "30D") {
                const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                onFilterChange({ from: last30.toISOString(), to: undefined, page: 1 });
              } else {
                onFilterChange({ from: undefined, to: undefined, page: 1 });
              }
            }}
            className="w-full h-8 px-2.5 bg-background border border-border text-[11px] font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Todas las fechas</option>
            <option value="TODAY">Hoy</option>
            <option value="7D">Últimos 7 días</option>
            <option value="30D">Últimos 30 días</option>
          </select>
        </div>

        {/* Botón de limpiar filtros */}
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
