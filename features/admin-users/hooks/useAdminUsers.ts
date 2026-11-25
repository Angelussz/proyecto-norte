"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchAdminUsers } from "@/features/admin-users/services/admin-users.service";
import { adminUsersKeys } from "@/features/admin-users/hooks/admin-users.keys";
import type {
  AdminUserFilters,
  AdminUsersListResponse,
} from "@/features/admin-users/types/admin-user.interface";

export function useAdminUsers(filters: AdminUserFilters = {}) {
  const query = useQuery<AdminUsersListResponse, Error>({
    queryKey: adminUsersKeys.list(filters),
    queryFn: ({ signal }) => fetchAdminUsers(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    users: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
