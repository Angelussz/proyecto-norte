"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  AdminApiError,
  cancelAdminOrderApi,
  updateAdminOrderStatusApi,
} from "@/features/admin-orders/services/admin-orders.service";
import { adminOrdersKeys } from "@/features/admin-orders/hooks/admin-orders.keys";
import type {
  AdminOrderDetail,
  CancelOrderDto,
  UpdateOrderStatusDto,
} from "@/features/admin-orders/types/admin-order.interface";

// ─── Helpers de Sincronización de Caché ───────────────────────────────────────

/**
 * Sincroniza la caché de React Query tras una mutación exitosa:
 * 1. Invalida las listas de órdenes para refrescar contadores, estados y filtros.
 * 2. Actualiza inmediatamente el detalle individual en memoria con los nuevos datos.
 */
function syncOrderCacheOnSuccess(queryClient: QueryClient, order: AdminOrderDetail) {
  queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
  queryClient.setQueryData(adminOrdersKeys.detail(order.id), order);
}

/**
 * Maneja errores de mutación. Si detecta un conflicto de concurrencia (409 Conflict),
 * invalida automáticamente el detalle de la orden para recuperar su versión fresca de la DB.
 */
function syncOrderCacheOnError(queryClient: QueryClient, error: unknown, orderId: string) {
  if (error instanceof AdminApiError && error.code === "CONFLICT") {
    queryClient.invalidateQueries({ queryKey: adminOrdersKeys.detail(orderId) });
  }
}

// ─── Hooks de Mutación ────────────────────────────────────────────────────────

/**
 * Mutación para actualizar el estado operativo de una orden.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminOrderDetail,
    AdminApiError | Error,
    { id: string; dto: UpdateOrderStatusDto }
  >({
    mutationFn: ({ id, dto }) => updateAdminOrderStatusApi(id, dto),
    onSuccess: (order) => syncOrderCacheOnSuccess(queryClient, order),
    onError: (error, { id }) => syncOrderCacheOnError(queryClient, error, id),
  });
}

/**
 * Mutación para cancelar una orden y reintegrar inventario.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<AdminOrderDetail, AdminApiError | Error, { id: string; dto: CancelOrderDto }>({
    mutationFn: ({ id, dto }) => cancelAdminOrderApi(id, dto),
    onSuccess: (order) => syncOrderCacheOnSuccess(queryClient, order),
    onError: (error, { id }) => syncOrderCacheOnError(queryClient, error, id),
  });
}
