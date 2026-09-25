import { getBaseUrl } from "@/features/product/services/product-catalog.service";
import type {
  CategoriesResponse,
  Category,
} from "@/features/category/types/category.interface";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${getBaseUrl()}/api/categories`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`[category.service] GET /api/categories devolvió ${res.status}`);
  }

  const payload = (await res.json()) as CategoriesResponse;
  return payload.data;
}