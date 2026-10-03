"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductDetail } from "@/features/product/services/product.service";
import type { ProductDetailResponse } from "@/features/product/types/product.interface";

export function useProductDetail(id: string | undefined) {
  const query = useQuery<ProductDetailResponse | null>({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id as string),
    enabled: !!id,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
