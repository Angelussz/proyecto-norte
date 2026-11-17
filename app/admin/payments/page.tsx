"use client";

import { useState } from "react";

import { useAdminPayments } from "@/features/admin-payments/hooks/useAdminPayments";
import type {
  AdminPayment,
  AdminPaymentFilters,
} from "@/features/admin-payments/types/admin-payment.interface";

import { PaymentsFiltersBar } from "@/features/admin-payments/components/payments-filters-bar";
import { PaymentsTable } from "@/features/admin-payments/components/payments-table";
import { PaymentDetailDialog } from "@/features/admin-payments/components/payment-detail-dialog";

export default function AdminPaymentsPage() {
  const [filters, setFilters] = useState<AdminPaymentFilters>({
    page: 1,
    limit: 10,
    status: "ALL",
    method: "ALL",
  });

  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  const { payments, pagination, isLoading, isFetching, isError, error, refetch } =
    useAdminPayments(filters);

  function handleFilterChange(newFilters: Partial<AdminPaymentFilters>) {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1,
    }));
  }

  function handleClearFilters() {
    setFilters({
      page: 1,
      limit: 10,
      status: "ALL",
      method: "ALL",
      search: undefined,
      from: undefined,
      to: undefined,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:px-6 md:px-8">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">PAGOS</h1>

        <p className="text-sm text-muted-foreground">
          Consulta, filtros y seguimiento de pagos de las órdenes.
        </p>
      </div>

      <PaymentsFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        paymentsForExport={payments}
      />

      {isError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          No se pudieron cargar los pagos: {error?.message ?? "Error desconocido"}.
          <button type="button" onClick={() => refetch()} className="ml-2 font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      <PaymentsTable payments={payments} isLoading={isLoading} onViewPayment={setSelectedPayment} />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} pagos
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isFetching}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: (prev.page ?? 1) - 1,
                }))
              }
              className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isFetching}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: (prev.page ?? 1) + 1,
                }))
              }
              className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <PaymentDetailDialog payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </div>
  );
}
