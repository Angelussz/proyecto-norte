"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateAdminSettings,
  type AdminSettingsApiError,
} from "../services/admin-settings.service";
import type {
  AdminSettingsResponse,
  UpdateAdminSettingsDto,
} from "../types/admin-settings.interface";
import { adminSettingsKeys } from "./admin-settings.keys";

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AdminSettingsResponse,
    AdminSettingsApiError | Error,
    UpdateAdminSettingsDto
  >({
    mutationFn: updateAdminSettings,
    onSuccess: (response) => {
      queryClient.setQueryData(adminSettingsKeys.all, response);
    },
  });

  return {
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
