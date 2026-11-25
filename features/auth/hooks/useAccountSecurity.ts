"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAccountSecurityApi } from "@/features/auth/services/account-client.service";
import type { AccountSecurityResponse } from "@/features/auth/types/auth.interface";

export const ACCOUNT_SECURITY_QUERY_KEY = ["account-security"] as const;

export function useAccountSecurity() {
  return useQuery<AccountSecurityResponse>({
    queryKey: ACCOUNT_SECURITY_QUERY_KEY,
    queryFn: fetchAccountSecurityApi,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
