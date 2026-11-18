import type { AdminOrderFilters } from "@/features/admin-orders/types/admin-order.interface";

/**
 * Fábrica centralizada de llaves de consulta (Query Key Factory) para React Query.
 * Elimina cadenas mágicas repetidas y garantiza que las invalidaciones siempre apunten
 * a la misma estructura de claves.
 */
export const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  list: (filters: AdminOrderFilters = {}) => ["admin", "orders", filters] as const,
  detail: (id: string) => ["admin", "orders", id] as const,
};
