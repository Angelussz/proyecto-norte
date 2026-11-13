import type {
  AdminOrderDetail,
  AdminOrderFilters,
  AdminOrderListResponse,
  CancelOrderDto,
  UpdateOrderStatusDto,
} from "@/features/admin-orders/types/admin-order.interface";

/**
 * Error tipado emitido por las llamadas al API de administración de órdenes.
 */
export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

/**
 * Parsea respuestas fallidas de la API y lanza un AdminApiError con código y mensaje.
 */
async function handleResponseError(res: Response, fallbackMessage: string): Promise<never> {
  let errorJson: { error?: string; message?: string } | null = null;
  try {
    errorJson = await res.json();
  } catch {
    // Si no es JSON legible, errorJson permanece en null
  }

  const code = errorJson?.error || (res.status === 409 ? "CONFLICT" : "API_ERROR");
  const message = errorJson?.message || fallbackMessage;
  throw new AdminApiError(res.status, code, message);
}

/**
 * Consulta la lista paginada y filtrable de órdenes para el panel administrativo.
 */
export async function fetchAdminOrders(
  filters: AdminOrderFilters = {},
  signal?: AbortSignal,
): Promise<AdminOrderListResponse> {
  const params = new URLSearchParams();

  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search.trim());
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const url = `/api/admin/orders${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    signal,
    credentials: "same-origin",
  });

  if (!res.ok) {
    await handleResponseError(res, `Error al obtener órdenes (${res.status})`);
  }

  return (await res.json()) as AdminOrderListResponse;
}

/**
 * Consulta el detalle completo relacional de una orden.
 */
export async function fetchAdminOrderDetail(
  id: string,
  signal?: AbortSignal,
): Promise<AdminOrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: "GET",
    signal,
    credentials: "same-origin",
  });

  if (!res.ok) {
    await handleResponseError(res, `Error al obtener la orden "${id}" (${res.status})`);
  }

  return (await res.json()) as AdminOrderDetail;
}

/**
 * Actualiza el estado operativo de una orden (PATCH) validando concurrencia (409) y máquina de estados.
 */
export async function updateAdminOrderStatusApi(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<AdminOrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    await handleResponseError(res, `Error al actualizar el estado de la orden "${id}"`);
  }

  return (await res.json()) as AdminOrderDetail;
}

/**
 * Cancela una orden de forma atómica y reintegra el inventario según corresponda.
 */
export async function cancelAdminOrderApi(
  id: string,
  dto: CancelOrderDto,
): Promise<AdminOrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    await handleResponseError(res, `Error al cancelar la orden "${id}"`);
  }

  return (await res.json()) as AdminOrderDetail;
}
