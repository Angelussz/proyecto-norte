import type {
  Order,
  OrderListParams,
  OrderListResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusResult,
} from "@/features/orders/types/order.interface";
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

const VALID_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

/**
 * Actualiza el status de una orden con control de concurrencia optimista.
 * Verifica que el updated_at coincida con el valor esperado por el cliente.
 * Si otro usuario modificó la orden primero, retorna 409 Conflict.
 *
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/orders/${orderId}`, {
 *     method: "PATCH",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(params),
 *   });
 *   if (!res.ok) return { success: false, error: "Error al actualizar" };
 *   return (await res.json()) as UpdateOrderStatusResult;
 */
export async function updateOrderStatus(
  orderId: string,
  params: UpdateOrderStatusParams
): Promise<UpdateOrderStatusResult> {
  await delay(150);

  if (!VALID_STATUSES.includes(params.status)) {
    return { success: false, error: "Status inválido" };
  }

  const index = ORDERS_MOCK.findIndex((o) => o.id === orderId);
  if (index === -1) {
    return { success: false, error: "Orden no encontrada" };
  }

  const order = ORDERS_MOCK[index];

  if (order.updated_at !== params.expectedUpdatedAt) {
    return {
      success: false,
      error: "Conflicto: la orden fue modificada por otro usuario",
    };
  }

  ORDERS_MOCK[index] = {
    ...order,
    status: params.status,
    updated_at: new Date().toISOString(),
  };

  return { success: true, order: ORDERS_MOCK[index] };
}
