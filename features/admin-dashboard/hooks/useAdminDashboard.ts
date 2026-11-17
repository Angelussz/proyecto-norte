"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardStats } from "@/features/admin-dashboard/services/admin-dashboard.service";

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  stats: () => [...adminDashboardKeys.all, "stats"] as const,
};

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: ({ signal }) => fetchAdminDashboardStats(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
