import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductDetail } from "@/features/product/services/product.service";
import { ProductInfo } from "@/features/store/components/product-info";
import { ProductSuggestions } from "@/features/store/components/product-suggestions";

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

  const crumbs = [
    { label: "Shop", href: "/" },
    { label: product.category_name ?? "Productos", href: '/products' },
    { label: product.name ?? 'N/A', href: '' },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-16 md:py-12">
      <nav
        aria-label="Breadcrumbs"
        className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"
      >
        {crumbs.map((crumb, i: number) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {last || !crumb.href ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link href={crumb.href} className="transition-colors hover:text-primary">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="size-4" />
                </>
              )}
            </span>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex flex-col gap-2">
            <div className="group relative aspect-4/5 w-full overflow-hidden bg-muted">
              <Image
                src={product.images[0] || ""}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((src: string, i: number) => (
                <div
                  key={src + i}
                  className={`relative aspect-square w-24 shrink-0 overflow-hidden bg-muted md:w-28 ${i === 0 ? "ring-1 ring-foreground" : ""}`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} — vista ${i + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-6 md:sticky md:top-24">
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductSuggestions items={suggestions} />
    </section>
  );
}
