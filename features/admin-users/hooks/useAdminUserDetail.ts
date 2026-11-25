"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminUserDetail } from "@/features/admin-users/services/admin-users.service";
import { adminUsersKeys } from "@/features/admin-users/hooks/admin-users.keys";
import type { AdminUserDetail } from "@/features/admin-users/types/admin-user.interface";

/**
 * Hook para consultar el detalle completo de un usuario.
 */
export function useAdminUserDetail(id: string) {
  const query = useQuery<AdminUserDetail, Error>({
    queryKey: adminUsersKeys.detail(id),
    queryFn: ({ signal }) => fetchAdminUserDetail(id, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
