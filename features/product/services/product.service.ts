import type { ProductDetailResponse } from "@/features/product/types/product.interface";
import { getBaseUrl } from "@/features/product/services/product-catalog.service";

/**
 * Capa de servicio — detalle de producto.
 * Consume: GET /api/products/[id] -> { product, suggestions }
 * - Devuelve null si la API responde 404 (la page hace notFound()).
 * - Lanza un error si la API falla (500/red); React Query lo marca como isError.
 */
export async function getProductDetail(
  id: string,
): Promise<ProductDetailResponse | null> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(
      `[product.service] GET /api/products/${id} devolvió ${res.status}`,
    );
  }

  return (await res.json()) as ProductDetailResponse;
}
