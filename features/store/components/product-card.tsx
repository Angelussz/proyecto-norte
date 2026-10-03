import Image from "next/image";
import Link from "next/link";
import type { ProductCatalogItem } from "@/features/product/types/product-catalog.interface";
import { formatPrice } from "@/lib/products";

interface ProductCardProps {
  product: ProductCatalogItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <article>
        <div className="relative aspect-4/5 overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>

          <h2 className="mt-1 text-sm font-medium">
            {product.name}
          </h2>

          <p className="mt-1 text-sm">
            {formatPrice(product.base_price)}
          </p>

          <button
            type="button"
            className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    </Link>
  );
}