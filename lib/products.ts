import type { ProductDetail, ProductVariant } from "../interfaces/product.interface";

/**
 * Helpers puros de producto (sin fetching ni mocks).
 * El fetching vive en services/product.service.ts y los datos en lib/mocks.ts.
 */

export function getGalleryImages(product: ProductDetail): string[] {
  return [product.images.main, ...product.images.thumbnails];
}

/** Fuente de verdad: stock por variante. stock === 0 => talla no disponible. */
export function isSizeAvailable(variant: ProductVariant): boolean {
  return variant.stock > 0;
}

export function getTotalVariantStock(product: ProductDetail): number {
  return product.variants.reduce((acc, v) => acc + v.stock, 0);
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
