"use client";

import { useAdminDashboard } from "@/features/admin-dashboard/hooks/useAdminDashboard";
import { DashboardOrdersCards } from "@/features/admin-dashboard/components/dashboard-orders-cards";
import { DashboardPaymentsCards } from "@/features/admin-dashboard/components/dashboard-payments-cards";
import { DashboardRecentOrders } from "@/features/admin-dashboard/components/dashboard-recent-orders";
import { RefreshCw, AlertCircle } from "lucide-react";

function formatUSD(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function AdminPage() {
  const { stats, isLoading, isError, refetch, isFetching } = useAdminDashboard();

  const netRevenue = stats
    ? Number(stats.payments.approvedAmount) - Number(stats.refunds.successfulAmount)
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-6 sm:px-6 md:px-8">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1
            className="text-3xl font-normal tracking-[0.22em] text-foreground uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            DASHBOARD
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Resumen general de operaciones, pedidos y pagos
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-2 border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {isLoading && (
        <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando estadísticas...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between gap-3 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>No se pudieron cargar las estadísticas.</span>
          </div>
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            Reintentar
          </button>
        </div>
      )}

      {stats && (
        <>
          <section className="border border-border bg-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ingresos netos registrados
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {formatUSD(netRevenue)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pagos aprobados menos devoluciones exitosas.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Estado de pedidos
              </h2>
            </div>
            <DashboardOrdersCards orders={stats.orders} />
          </section>

          <section className="flex flex-col gap-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Últimos pedidos
              </h2>
            </div>
            <DashboardRecentOrders orders={stats.recentOrders} />
          </section>

          <section className="flex flex-col gap-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Pagos y devoluciones
              </h2>
            </div>
            <DashboardPaymentsCards payments={stats.payments} refunds={stats.refunds} />
          </section>
        </>
      )}
    </div>
  );
}
