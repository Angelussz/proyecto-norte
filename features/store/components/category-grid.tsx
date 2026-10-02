"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useCategories } from "@/features/category/hooks/useCategories";

export function CategoryGrid() {
  const { data: categories, isLoading, isError, refetch } = useCategories();

  let content;

  if (isLoading) {
    content = (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-3/4 mb-4 bg-[#fff9ed]/10" />
            <div className="mx-auto h-3 w-24 bg-[#fff9ed]/20" />
          </div>
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="py-12 text-center">
        <p className="text-[14px] uppercase tracking-wider">
          No pudimos cargar las categorías.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wider text-[#fff9ed] hover:text-[#C77D2E] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  } else if (!categories?.length) {
    content = (
      <div className="py-12 text-center">
        <p className="text-[14px] uppercase tracking-wider">
          No hay categorías disponibles.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href="/products" className="group block text-center">
            <div className="relative aspect-3/4 mb-4 overflow-hidden rounded-none bg-[#f4eddf]">
              <Image
                alt={`${category.name} Category`}
                className="object-cover absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
                src={category.image_url ?? "/category-accessories.jpg"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <h3 className="text-[14px] font-semibold uppercase tracking-wider">
              {category.slug}
            </h3>
            <p className="text-[12px] font-medium text-[#fff9ed]/70">Collection</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-[#33402F] py-16 text-[#fff9ed]">
      <div className="px-5 md:px-16 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-[#D8D2C4]/20 pb-4">
          <h2
            className="text-[32px] leading-9 tracking-[0.02em] uppercase"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Comprar por Categoria
          </h2>
          <Link
            href="/products"
            className="text-[14px] font-semibold uppercase tracking-wider flex items-center hover:text-[#C77D2E] transition-colors"
          >
            Explorar todo <ArrowRight className="ml-1 w-4.5 h-4.5" />
          </Link>
        </div>

        {content}
      </div>
    </section>
  );
}