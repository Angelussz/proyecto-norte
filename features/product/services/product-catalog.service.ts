import { PRODUCTS_MOCK } from "@/lib/mocks";
import type {
  ProductCatalogItem,
  ProductCatalogParams,
  ProductCatalogResponse,
} from "@/features/product/types/product-catalog.interface";

/**
 * Fallback local con mocks si la API o la base de datos no responden.
 */
function getLocalMockFallback(params: ProductCatalogParams): ProductCatalogResponse {
  let filtered: ProductCatalogItem[] = PRODUCTS_MOCK.map((item, idx) => ({
    id: String(idx + 1),
    name: item.name,
    slug: item.name.toLowerCase().replace(/\s+/g, "-"),
    base_price: item.price,
    image_url: item.image,
    category: {
      id: `cat-${item.category.toLowerCase()}`,
      name: item.category,
      slug: item.category.toLowerCase(),
    },
  }));

  if (params.category && params.category !== "Todas" && params.category !== "todas") {
    filtered = filtered.filter(
      (p) =>
        p.category.slug.toLowerCase() === params.category?.toLowerCase() ||
        p.category.name.toLowerCase() === params.category?.toLowerCase()
    );
  }

  if (params.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.base_price >= (params.minPrice ?? 0));
  }

  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.base_price <= (params.maxPrice ?? Infinity));
  }

  if (params.sortBy === "price_asc") {
    filtered.sort((a, b) => a.base_price - b.base_price);
  } else if (params.sortBy === "price_desc") {
    filtered.sort((a, b) => b.base_price - a.base_price);
  } else if (params.sortBy === "name_asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 12));
  const total = filtered.length;
  const skip = (page - 1) * limit;
  const data = filtered.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Servicio del catálogo público de productos.
 * Consume: GET /api/products (con conexión a base de datos PostgreSQL via Prisma).
 * En caso de fallo o desconexión, activa automáticamente el MOCK como fallback.
 */
export async function getProductCatalog(
  params: ProductCatalogParams = {}
): Promise<ProductCatalogResponse> {
  const query = new URLSearchParams();

  if (params.category)               query.set("category", params.category);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.sortBy)                 query.set("sortBy", params.sortBy);
  if (params.page !== undefined)     query.set("page", String(params.page));
  if (params.limit !== undefined)    query.set("limit", String(params.limit));

  const url = `/api/products?${query.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[product-catalog.service] La API devolvió ${res.status}, usando fallback mock`);
      return getLocalMockFallback(params);
    }

    return (await res.json()) as ProductCatalogResponse;
  } catch (error) {
    console.warn("[product-catalog.service] Error al conectar con /api/products, usando fallback mock:", error);
    return getLocalMockFallback(params);
  }
}
