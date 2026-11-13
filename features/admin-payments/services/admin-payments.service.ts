import type {
  AdminPaymentFilters,
  AdminPaymentsListResponse,
} from "@/features/admin-payments/types/admin-payment.interface";

export class AdminPaymentsApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminPaymentsApiError";
    this.status = status;
    this.code = code;
  }
}

async function handleResponseError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);

  throw new AdminPaymentsApiError(
    body?.message ?? body?.error ?? "Error al consultar los pagos",
    response.status,
    body?.code,
  );
}

export async function fetchAdminPayments(
  filters: AdminPaymentFilters = {},
  signal?: AbortSignal,
): Promise<AdminPaymentsListResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.method && filters.method !== "ALL") {
    params.set("method", filters.method);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = params.toString();
  const url = query ? `/api/admin/payments?${query}` : "/api/admin/payments";

  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    await handleResponseError(response);
  }

  return (await response.json()) as AdminPaymentsListResponse;
}
