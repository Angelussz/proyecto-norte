import type { AdminPaymentFilters } from "@/features/admin-payments/types/admin-payment.interface";

export const adminPaymentsKeys = {
  all: ["admin", "payments"] as const,
  list: (filters: AdminPaymentFilters = {}) => ["admin", "payments", filters] as const,
};
