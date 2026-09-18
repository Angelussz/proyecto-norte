import type { Order } from "@/features/orders/types/order.interface";

/**
 * Helpers puros de órdenes (sin fetching ni mocks).
 * El fetching vive en services/order.service.ts y los datos en lib/mocks.ts.
 */

type PrismaOrder = {
  id: string;
  user_id: string;
  address_id: string;
  subtotal: unknown;
  shipping_cost: unknown;
  total: unknown;
  status: Order["status"];
  created_at: Date;
  updated_at: Date;
  items: {
    id: string;
    order_id: string;
    variant_id: string;
    sku_snapshot: string;
    product_name_snapshot: string;
    unit_price: unknown;
    quantity: number;
    subtotal: unknown;
  }[];
};

/** Convierte una orden de Prisma (Decimal → number, Date → string) al formato de la interfaz Order. */
export function serializeOrder(o: PrismaOrder): Order {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    shipping_cost: Number(o.shipping_cost),
    total: Number(o.total),
    created_at: o.created_at.toISOString(),
    updated_at: o.updated_at.toISOString(),
    items: o.items.map((item) => ({
      ...item,
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    })),
  };
}
