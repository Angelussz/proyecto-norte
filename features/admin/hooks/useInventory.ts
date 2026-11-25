"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ColorVariant {
  name: string;
  hex: string;
}

export interface StockMatrix {
  [talle: string]: { [color: string]: number | null | undefined };
}

export interface InventoryProductCard {
  id: string;
  sku: string;
  category: string;
  name: string;
  pvp?: string;
  sizes: string[];
  colors: ColorVariant[];
  stock: StockMatrix;
  totalStock: number;
  stockLevel: "healthy" | "low" | "critical";
  expanded: boolean;
  image: string;
}

const INVENTORY_KEY = ["admin-inventory"] as const;

async function fetchInventory(): Promise<InventoryProductCard[]> {
  const res = await fetch("/api/admin/inventory");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Error al obtener el inventario.");
  }
  const json = await res.json();
  return json.data as InventoryProductCard[];
}

export function useInventoryProducts() {
  return useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: fetchInventory,
  });
}

export function useUpdateInventoryProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      sizes: string[];
      colors: ColorVariant[];
      stock: StockMatrix;
    }) => {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Error al actualizar el inventario.");
      }

      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useDeleteInventoryProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Error al eliminar el producto.");
      }

      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
