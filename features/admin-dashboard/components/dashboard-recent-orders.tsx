import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard.interface";

interface DashboardRecentOrdersProps {
  orders: AdminDashboardStats["recentOrders"];
}

const statusLabels: Record<AdminDashboardStats["recentOrders"][number]["status"], string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Pagado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function formatUSD(value: string | number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function DashboardRecentOrders({ orders }: DashboardRecentOrdersProps) {
  return (
    <section className="overflow-hidden border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-5 py-3 font-semibold text-muted-foreground">Pedido</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground">Cliente</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground">Fecha</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground">Total</th>
              <th className="px-5 py-3 font-semibold text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Todavía no hay pedidos registrados.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-medium text-foreground">#{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-foreground">
                    {order.user.name} {order.user.last_name}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4 font-medium tabular-nums text-foreground">
                    {formatUSD(order.total)}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{statusLabels[order.status]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
