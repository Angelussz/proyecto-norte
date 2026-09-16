import type { Order, OrderListParams, OrderListResponse } from "@/features/orders/types/order.interface";
import { ORDERS_MOCK } from "@/lib/mocks";

const DEFAULT_ITEMS = 12
const MIN_PAGE = 1;
const MAX_LIMIT = 48;
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capa de servicio — simula el llamado al backend.
 * Hoy resuelve desde lib/mocks.ts (ORDERS_MOCK).
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/orders?userId=${userId}`, { cache: "force-cache" });
 *   if (!res.ok) return [];
 *   return (await res.json()) as Order[];
 */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  await delay(150);
  return ORDERS_MOCK.filter((order) => order.user_id === userId);
}

/**
 * Obtiene una orden por su ID.
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/orders/${orderId}`, { cache: "force-cache" });
 *   if (!res.ok) return null;
 *   return (await res.json()) as Order;
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  await delay(150);
  return ORDERS_MOCK.find((order) => order.id === orderId) ?? null;
}

/**
 * Obtiene órdenes paginadas.
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/orders?page=${page}&limit=${limit}`, { cache: "force-cache" });
 *   if (!res.ok) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
 *   return (await res.json()) as OrderListResponse;
 */
export async function getOrdersPaginated(params?: OrderListParams): Promise<OrderListResponse> {
  await delay(150);

  const rawPage = params?.page ?? 1;
  const rawLimit = params?.limit ?? DEFAULT_ITEMS;
  const page = isNaN(rawPage) ? MIN_PAGE : Math.max(MIN_PAGE, rawPage);
  const limit = isNaN(rawLimit) ? DEFAULT_ITEMS : Math.min(MAX_LIMIT, Math.max(1, rawLimit));

  let filtered = ORDERS_MOCK;
  if (params?.status) {
    filtered = filtered.filter((order) => order.status === params.status);
  }

  const total = filtered.length;
  const skip = (page - 1) * limit;
  const data = filtered.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
