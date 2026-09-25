import type {
  ProductCatalogParams,
  ProductCatalogResponse,
} from "@/features/product/types/product-catalog.interface";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Servicio del catálogo público de productos.
 * Consume: GET /api/products
 * Lanza un error si la API falla; no usa fallback mock en el cliente.
 */
export async function getProductCatalog(
  params: ProductCatalogParams = {},
  options?: { signal?: AbortSignal }
): Promise<ProductCatalogResponse> {
  const query = new URLSearchParams();

  if (params.category)               query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.sortBy)                 query.set("sortBy", params.sortBy);
  if (params.page !== undefined)     query.set("page", String(params.page));
  if (params.limit !== undefined)    query.set("limit", String(params.limit));

  const queryString = query.toString();
  const url = `${getBaseUrl()}/api/products${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, { signal: options?.signal });

  if (!res.ok) {
    throw new Error(`La API devolvió ${res.status} al obtener el catálogo`);
  }

  return (await res.json()) as ProductCatalogResponse;
}