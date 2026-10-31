import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showDot?: boolean;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PENDING_PAYMENT: {
    label: "Pendiente",
    bg: "bg-muted/80",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
  PAID: {
    label: "Pagada",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    dot: "bg-primary",
  },
  PREPARING: {
    label: "En preparación",
    bg: "bg-primary/15",
    text: "text-primary",
    border: "border-primary/40",
    dot: "bg-primary",
  },
  SHIPPED: {
    label: "Enviada",
    bg: "bg-secondary/15",
    text: "text-secondary",
    border: "border-secondary/40",
    dot: "bg-secondary",
  },
  DELIVERED: {
    label: "Entregada",
    bg: "bg-foreground/10",
    text: "text-foreground",
    border: "border-border",
    dot: "bg-foreground",
  },
  CANCELLED: {
    label: "Cancelada",
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
    dot: "bg-destructive",
  },
};

export function OrderStatusBadge({
  status,
  className = "",
  showDot = true,
}: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {showDot && (
        <span
          className={`size-1.5 rounded-full shrink-0 ${config.dot} ${
            status === "PREPARING" ? "animate-pulse" : ""
          }`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
