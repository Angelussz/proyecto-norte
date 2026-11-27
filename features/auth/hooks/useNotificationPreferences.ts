"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotificationPreferencesApi } from "@/features/auth/services/account-client.service";
import type { NotificationPreferences } from "@/features/auth/types/auth.interface";

export const NOTIFICATION_PREFS_QUERY_KEY = ["account-notifications"] as const;

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: NOTIFICATION_PREFS_QUERY_KEY,
    queryFn: fetchNotificationPreferencesApi,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
