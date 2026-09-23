"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/category/services/category.service";
import type { Category } from "@/features/category/types/category.interface";

export function useCategories() {
  const query = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}