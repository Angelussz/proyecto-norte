export type AdminPaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminPaymentMethod = "CARD" | "TRANSFER" | "CASH_ON_DELIVERY";

export type AdminPaymentFilters = {
  page?: number;
  limit?: number;
  status?: AdminPaymentStatus | "ALL";
  method?: AdminPaymentMethod | "ALL";
  search?: string;
  from?: string;
  to?: string;
};

export interface AdminPaymentUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
}

export interface AdminPaymentOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user: AdminPaymentUser;
}

export interface AdminPayment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: AdminPaymentMethod;
  gateway: "STRIPE" | "MERCADO_PAGO" | "NONE";
  gateway_transaction_id: string | null;
  voucher_url: string | null;
  status: AdminPaymentStatus;
  rejection_reason: string | null;
  paid_at: string | null;
  created_at: string;
  order: AdminPaymentOrder;
}

export interface AdminPaymentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminPaymentsListResponse {
  data: AdminPayment[];
  pagination: AdminPaymentsPagination;
}
