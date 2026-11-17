export interface CreateAdminRefundDto {
  reason: string;
  amount?: number;
}

export interface AdminRefundResponse {
  refund: {
    id: string;
    amount: number;
    reason: string;
    status: string;
    stripe_refund_id?: string | null;
    created_at?: string;
    completed_at?: string | null;
  };
  repeated_request: boolean;
  requires_review: boolean;
}

export class AdminRefundApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminRefundApiError";
    this.status = status;
    this.code = code;
  }
}

export async function createAdminRefund(
  orderId: string,
  dto: CreateAdminRefundDto,
  idempotencyKey: string,
): Promise<AdminRefundResponse> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/payment/refund`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(dto),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AdminRefundApiError(
      body?.message ?? body?.error ?? "No se pudo solicitar el reembolso",
      response.status,
      body?.code,
    );
  }

  return body as AdminRefundResponse;
}
