import type {
  ProductCatalogParams,
  ProductCatalogResponse,
} from "@/features/product/types/product-catalog.interface";

/**
 * Servicio del catálogo público de productos.
 * Hoy consume: GET /api/products (Next.js API Route con Prisma).
 * Parámetros soportados: category, minPrice, maxPrice, sortBy, page, limit.
 */
export async function getProductCatalog(
  params: ProductCatalogParams = {}
): Promise<ProductCatalogResponse> {
  const query = new URLSearchParams();

  if (params.category)             query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.sortBy)               query.set("sortBy", params.sortBy);
  if (params.page !== undefined)   query.set("page", String(params.page));
  if (params.limit !== undefined)  query.set("limit", String(params.limit));

  const url = `/api/products?${query.toString()}`;

  const res = await fetch(url, {
    // En Server Components Next.js cachea por defecto.
    // Revalidamos cada 60 s para que el catálogo no quede desactualizado.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener productos: ${res.status}`);
  }

  return res.json() as Promise<ProductCatalogResponse>;
}
