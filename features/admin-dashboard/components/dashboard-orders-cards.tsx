import {
  ClipboardList,
  Clock,
  CircleDollarSign,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard.interface";

interface DashboardOrdersCardsProps {
  orders: AdminDashboardStats["orders"];
}

const metrics = [
  {
    key: "total",
    label: "Total de pedidos",
    icon: ClipboardList,
  },
  {
    key: "pendingPayment",
    label: "Pendientes de pago",
    icon: Clock,
  },
  {
    key: "paid",
    label: "Pedidos pagados",
    icon: CircleDollarSign,
  },
  {
    key: "preparing",
    label: "En preparación",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Enviados",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Entregados",
    icon: CheckCircle2,
  },
  {
    key: "cancelled",
    label: "Cancelados",
    icon: XCircle,
  },
] as const;

export function DashboardOrdersCards({ orders }: DashboardOrdersCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            key={metric.key}
            className="flex items-center justify-between border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-3xl font-semibold tabular-nums text-foreground">
                {orders[metric.key]}
              </p>
            </div>

            <Icon className="size-6 text-muted-foreground" />
          </article>
        );
      })}
    </section>
  );
}
