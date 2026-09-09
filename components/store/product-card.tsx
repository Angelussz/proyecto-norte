import Image from "next/image";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  image: string;
}

export function ProductCard({
  name,
  category,
  price,
  image,
}: ProductCardProps) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </p>

        <h2 className="mt-1 text-sm font-medium">
          {name}
        </h2>

        <p className="mt-1 text-sm">
          ${price}
        </p>

        <button
          type="button"
          className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}