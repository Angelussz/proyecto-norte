"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdminRefund,
  type CreateAdminRefundDto,
  type AdminRefundResponse,
  type AdminRefundApiError,
} from "@/features/admin-payments/services/admin-refunds.service";
import { adminOrdersKeys } from "@/features/admin-orders/hooks/admin-orders.keys";
import { adminPaymentsKeys } from "@/features/admin-payments/hooks/admin-payments.keys";

interface CreateRefundVariables {
  orderId: string;
  dto: CreateAdminRefundDto;
  idempotencyKey: string;
}

export function useAdminRefund() {
  const queryClient = useQueryClient();

  return useMutation<AdminRefundResponse, AdminRefundApiError | Error, CreateRefundVariables>({
    mutationFn: ({ orderId, dto, idempotencyKey }) =>
      createAdminRefund(orderId, dto, idempotencyKey),

    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminOrdersKeys.detail(variables.orderId),
      });

      queryClient.invalidateQueries({
        queryKey: adminOrdersKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: adminPaymentsKeys.all,
      });
    },
  });
}
