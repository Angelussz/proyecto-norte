"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminOrders } from "@/features/admin-orders/services/admin-orders.service";
import { adminOrdersKeys } from "@/features/admin-orders/hooks/admin-orders.keys";
import type {
  AdminOrderFilters,
  AdminOrderListResponse,
} from "@/features/admin-orders/types/admin-order.interface";

/**
 * Hook para consultar y paginar la lista de órdenes en el panel de administración.
 * Utiliza keepPreviousData para que el cambio de página o filtro sea fluido sin parpadeos.
 */
export function useAdminOrders(filters: AdminOrderFilters = {}) {
  const query = useQuery<AdminOrderListResponse, Error>({
    queryKey: adminOrdersKeys.list(filters),
    queryFn: ({ signal }) => fetchAdminOrders(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    orders: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
