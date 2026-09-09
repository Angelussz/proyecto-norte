/**
 * Contrato backend para el detalle de producto.
 * Fuente de verdad futura: GET /api/products/[id] -> ProductDetailResponse
 * Fase actual: mock en lib/mocks.ts que respeta estos tipos.
 */

export type ProductVariant = {
  size: string;
  stock: number;
}

export type ProductImages = {
  main: string;
  thumbnails: string[];
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  images: ProductImages;
};

export type Suggestion = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type ProductDetailResponse = {
  product: ProductDetail;
  suggestions: Suggestion[];
};
