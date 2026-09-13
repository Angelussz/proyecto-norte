import { ProductCard } from "./product-card";

interface Product {
  name: string;
  category: string;
  price: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          name={product.name}
          category={product.category}
          price={product.price}
          image={product.image}
        />
      ))}
    </div>
  );
}