import {
  CreditCard,
  Clock,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard.interface";

interface DashboardPaymentsCardsProps {
  payments: AdminDashboardStats["payments"];
  refunds: AdminDashboardStats["refunds"];
}

function formatUSD(value: string | number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

export function DashboardPaymentsCards({ payments, refunds }: DashboardPaymentsCardsProps) {
  const metrics = [
    {
      label: "Pagos aprobados",
      value: payments.approvedCount,
      detail: formatUSD(payments.approvedAmount),
      icon: CreditCard,
    },
    {
      label: "Pagos pendientes",
      value: payments.pendingCount,
      icon: Clock,
    },
    {
      label: "Pagos rechazados",
      value: payments.rejectedCount,
      icon: AlertCircle,
    },
    {
      label: "Devoluciones exitosas",
      value: refunds.successfulCount,
      detail: formatUSD(refunds.successfulAmount),
      icon: CheckCircle2,
    },
    {
      label: "Devoluciones en proceso",
      value: refunds.inProgressCount,
      icon: RefreshCcw,
    },
    {
      label: "Devoluciones en revisión",
      value: refunds.requiresReviewCount,
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            key={metric.label}
            className="flex items-center justify-between border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-3xl font-semibold tabular-nums text-foreground">{metric.value}</p>
              {metric.detail && <p className="text-sm text-muted-foreground">{metric.detail}</p>}
            </div>

            <Icon className="size-6 text-muted-foreground" />
          </article>
        );
      })}
    </section>
  );
}
