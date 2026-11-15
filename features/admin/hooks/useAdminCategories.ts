/**
 * features/admin/hooks/useAdminCategories.ts
 *
 * Hooks TanStack Query para CRUD de categorías en el panel admin.
 * Mismo patrón que useSizeGroups.ts y useBrands.ts.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AdminCategoryDto,
  CreateAdminCategoryBody,
  UpdateAdminCategoryBody,
} from "@/features/admin/types/admin-category.interface";

const QUERY_KEY = ["admin", "categories"] as const;

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<AdminCategoryDto[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Error al cargar categorías");
  const json = await res.json();
  return json.data as AdminCategoryDto[];
}

async function postCategory(body: CreateAdminCategoryBody): Promise<AdminCategoryDto> {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Error al crear categoría");
  }
  const json = await res.json();
  return json.data as AdminCategoryDto;
}

async function putCategory({
  id,
  body,
}: {
  id: string;
  body: UpdateAdminCategoryBody;
}): Promise<AdminCategoryDto> {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Error al actualizar categoría");
  }
  const json = await res.json();
  return json.data as AdminCategoryDto;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Error al eliminar categoría");
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export function useCreateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
