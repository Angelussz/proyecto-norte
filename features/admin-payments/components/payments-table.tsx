"use client";

import { Eye } from "lucide-react";

import type { AdminPayment } from "@/features/admin-payments/types/admin-payment.interface";

interface PaymentsTableProps {
  payments: AdminPayment[];
  onViewPayment: (payment: AdminPayment) => void;
  isLoading?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function PaymentStatusBadge({ status }: { status: AdminPayment["status"] }) {
  const styles = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const labels = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function PaymentsTable({ payments, onViewPayment, isLoading = false }: PaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando pagos...
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="border border-border bg-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">No se encontraron pagos</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Probá modificando los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Pago / Pedido</th>
            <th className="px-4 py-3 font-semibold">Cliente</th>
            <th className="px-4 py-3 font-semibold">Método</th>
            <th className="px-4 py-3 font-semibold">Pasarela</th>
            <th className="px-4 py-3 text-right font-semibold">Importe</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 text-center font-semibold">Detalle</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {payments.map((payment) => (
            <tr key={payment.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-semibold text-foreground">{payment.id.slice(0, 8)}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Pedido: {payment.order_id.slice(0, 8)}
                </p>
              </td>

              <td className="px-4 py-3">
                <p className="font-medium text-foreground">
                  {payment.order.user.name} {payment.order.user.last_name}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{payment.order.user.email}</p>
              </td>

              <td className="px-4 py-3 text-foreground">
                {payment.payment_method === "CARD"
                  ? "Tarjeta"
                  : payment.payment_method === "TRANSFER"
                    ? "Transferencia"
                    : "Contra entrega"}
              </td>

              <td className="px-4 py-3 text-muted-foreground">
                {payment.gateway.replaceAll("_", " ")}
              </td>

              <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                {formatCurrency(payment.amount)}
              </td>

              <td className="px-4 py-3">
                <PaymentStatusBadge status={payment.status} />
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDate(payment.created_at)}
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onViewPayment(payment)}
                  title="Ver detalle del pago"
                  aria-label="Ver detalle del pago"
                  className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                >
                  <Eye className="size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
