"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrderDetail } from "@/features/admin-orders/services/admin-orders.service";
import { adminOrdersKeys } from "@/features/admin-orders/hooks/admin-orders.keys";
import type { AdminOrderDetail } from "@/features/admin-orders/types/admin-order.interface";

/**
 * Hook para consultar el detalle completo de una orden individual.
 */
export function useAdminOrderDetail(id: string) {
  const query = useQuery<AdminOrderDetail, Error>({
    queryKey: adminOrdersKeys.detail(id),
    queryFn: ({ signal }) => fetchAdminOrderDetail(id, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
