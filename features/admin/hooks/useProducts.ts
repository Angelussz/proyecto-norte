"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductDto, ProductListItem } from "@/features/admin/types/product.interface";

const PRODUCTS_KEY = ["admin-products"] as const;

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<ProductListItem[]> {
  const res = await fetch("/api/admin/products");
  if (!res.ok) throw new Error("Error al obtener los productos.");
  const json = await res.json();
  return json.data as ProductListItem[];
}

async function fetchProduct(id: string): Promise<ProductDto> {
  const res = await fetch(`/api/admin/products/${id}`);
  if (!res.ok) throw new Error("Error al obtener el producto.");
  const json = await res.json();
  return json.data as ProductDto;
}

async function fetchCreateProduct(form: FormData): Promise<{ id: string }> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Error al crear el producto.");
  }
  return res.json();
}

async function fetchUpdateProduct({
  id,
  form,
}: {
  id: string;
  form: FormData;
}): Promise<{ id: string }> {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PUT",
    body: form,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Error al actualizar el producto.");
  }
  const json = await res.json();
  return json.data;
}

async function fetchDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Error al eliminar el producto.");
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: fetchProducts });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => (id ? fetchProduct(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchCreateProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchUpdateProduct,
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: ["admin-product", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchDeleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const form = new FormData();
      form.set("active", String(active));
      const res = await fetch(`/api/admin/products/${id}`, { method: "PUT", body: form });
      if (!res.ok) throw new Error("Error al actualizar estado del producto");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}
