import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { Suggestion } from "@/interfaces/product.interface";

export function ProductSuggestions({ items }: { items: Suggestion[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24">
      <div className="mb-8 flex items-end justify-between">
        <h2
          className="text-3xl uppercase tracking-wide text-foreground md:text-4xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          You may also like
        </h2>
        <Link
          href="#"
          className="text-xs uppercase tracking-widest text-muted-foreground underline decoration-1 hover:text-primary"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} href={`/product/${item.id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
