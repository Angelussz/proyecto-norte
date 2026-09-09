import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getGalleryImages } from "@/lib/products";
import { getProductDetail } from "@/services/product.service";
import { ProductInfo } from "@/components/store/product-info";
import { ProductSuggestions } from "@/components/store/product-suggestions";

const CRUMBS = ["Shop", "Hombres", "Camisetas"];

export async function generateMetadata({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductDetail(id);

  if (!data) return { title: "Producto no encontrado — NORTE" };

  return {
    title: `${data.product.name} — NORTE`,
    description: data.product.description,
  };
}

export default async function ProductPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductDetail(id);
  
  if (!data) notFound();

  const { product, suggestions } = data;
  const [main, ...rest] = getGalleryImages(product);

  return (
    <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-16 md:py-12">
      <nav
        aria-label="Breadcrumbs"
        className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"
      >
        {CRUMBS.map((crumb: string, i: number) => {
          const last = i === CRUMBS.length - 1;
          return (
            <span key={crumb} className="flex items-center gap-2">
              {last ? (
                <span className="text-foreground">{crumb}</span>
              ) : (
                <>
                  <Link href="#" className="transition-colors hover:text-primary">
                    {crumb}
                  </Link>
                  <ChevronRight className="size-4" />
                </>
              )}
            </span>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="flex flex-col gap-2">
            <div className="group relative aspect-4/5 w-full overflow-hidden bg-muted">
              <Image
                src={main}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rest.slice(0, 2).map((src: string, i: number) => (
                <div
                  key={src + i}
                  className="relative aspect-4/5 w-full overflow-hidden bg-muted"
                >
                  <Image
                    src={src}
                    alt={`${product.name} — vista ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-5 md:sticky md:top-24">
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductSuggestions items={suggestions} />
    </section>
  );
}
