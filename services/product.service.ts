import type { ProductDetailResponse } from "@/interfaces/product.interface";
import { PRODUCT_BY_ID_MOCK } from "@/lib/mocks";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capa de servicio — simula el llamado al backend.
 * Hoy resuelve desde lib/mock.ts (PRODUCT_BY_ID_MOCK).
 * Para conectar la API real, reemplazar el cuerpo por:
 *   const res = await fetch(`${process.env.API_URL}/api/products/${id}`, { cache: "force-cache" });
 *   if (!res.ok) return null;
 *   return (await res.json()) as ProductDetailResponse;
 */
export async function getProductDetail(
  id: string
): Promise<ProductDetailResponse | null> {
  // Simula latencia de red
  await delay(150);

  if (id !== PRODUCT_BY_ID_MOCK.data.product.id) return null;

  return {
    product: PRODUCT_BY_ID_MOCK.data.product,
    suggestions: PRODUCT_BY_ID_MOCK.suggestions,
  };
}
