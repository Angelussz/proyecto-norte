"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BrandDto,
  CreateBrandBody,
  UpdateBrandBody,
} from "@/features/admin/types/brand-color.interface";

const BRANDS_KEY = ["brands"] as const;

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchBrands(): Promise<BrandDto[]> {
  const res = await fetch("/api/admin/brands");
  if (!res.ok) throw new Error("Error al obtener las marcas.");
  const json = await res.json();
  return json.data as BrandDto[];
}

async function fetchCreateBrand(body: CreateBrandBody): Promise<BrandDto> {
  const res = await fetch("/api/admin/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al crear la marca.");
  const json = await res.json();
  return json.data as BrandDto;
}

async function fetchUpdateBrand({
  id,
  body,
}: {
  id: string;
  body: UpdateBrandBody;
}): Promise<BrandDto> {
  const res = await fetch(`/api/admin/brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar la marca.");
  const json = await res.json();
  return json.data as BrandDto;
}

async function fetchDeleteBrand(id: string): Promise<void> {
  const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Error al eliminar la marca.");
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBrands() {
  return useQuery({ queryKey: BRANDS_KEY, queryFn: fetchBrands });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchCreateBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchUpdateBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
}
