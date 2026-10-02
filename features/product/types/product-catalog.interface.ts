/**
 * Tipos para el catálogo público de productos.
 * Endpoint: GET /api/products
 * Acceso: público (sin autenticación).
 */

/** Un producto tal como lo devuelve el endpoint del catálogo */
export type ProductCatalogItem = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  image_url: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

/** Parámetros de consulta soportados por GET /api/products */
export type ProductCatalogParams = {
  /** Slug de la categoría para filtrar, ej: "camisas" */
  category?: string;
  /** Precio mínimo */
  minPrice?: number;
  /** Precio máximo */
  maxPrice?: number;
  /** Campo y dirección de ordenamiento */
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "newest";
  /** Página actual (paginación), empieza en 1 */
  page?: number;
  /** Cantidad de productos por página */
  limit?: number;
};

/** Respuesta del endpoint GET /api/products */
export type ProductCatalogResponse = {
  data: ProductCatalogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
