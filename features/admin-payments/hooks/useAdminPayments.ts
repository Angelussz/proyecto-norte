"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchAdminPayments } from "@/features/admin-payments/services/admin-payments.service";
import { adminPaymentsKeys } from "@/features/admin-payments/hooks/admin-payments.keys";
import type {
  AdminPaymentFilters,
  AdminPaymentsListResponse,
} from "@/features/admin-payments/types/admin-payment.interface";

export function useAdminPayments(filters: AdminPaymentFilters = {}) {
  const query = useQuery<AdminPaymentsListResponse, Error>({
    queryKey: adminPaymentsKeys.list(filters),
    queryFn: ({ signal }) => fetchAdminPayments(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    payments: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
