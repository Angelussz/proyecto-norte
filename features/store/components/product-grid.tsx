import type { ProductCatalogItem } from "@/features/product/types/product-catalog.interface";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  items: ProductCatalogItem[];
}

export function ProductGrid({ items }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}