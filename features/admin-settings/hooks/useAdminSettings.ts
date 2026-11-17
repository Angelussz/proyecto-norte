"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAdminSettings } from "../services/admin-settings.service";
import { adminSettingsKeys } from "./admin-settings.keys";

export function useAdminSettings() {
  const query = useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: ({ signal }) => fetchAdminSettings(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    settings: query.data?.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
