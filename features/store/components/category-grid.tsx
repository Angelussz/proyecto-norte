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
        <p className="text-[14px] uppercase tracking-wider">No pudimos cargar las categorías.</p>
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
        <p className="text-[14px] uppercase tracking-wider">No hay categorías disponibles.</p>
      </div>
    );
  } else {
    const CATEGORY_ORDER = ["camisas", "pantalones", "accesorios", "calzados"];
    const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
      camisas:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDWdSprNGTgxBlN1l9XC3OYy2Oh9D7yMcVUDeG7098zFWsDT3HpL2B92bDQuAR6zwyXjt6uehYRC3mOqaYa9tm-gwm52bUyUhBunu7Jv3yL1MEMgCao2LskNiehlHjnxJ5kYSLOKg23F5F-G_azHETjahQZybCEz2y-14GEJY_w7yGO3KhJ6t1zyuxXnyaeOiilK2ALXNmKq4q20ze7q4J2eBVvwTrEyBWf74wAWzfkZidYNSWIFGPp",
      pantalones:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB7PzReJ2qcvlMj8hQMGCxwKDhPVVgSu9EJ6JfuycbYYJ4X1AoAy6X5n6M3Nc5vrh7LVk_BLkvidPtryUopotyrDCV-MzrBfqA6Fcbq0G94S0mgTVtkzfEy6Di3-sZI3YnV7ClVFuQ9rCXB-KP2sduxQqtEQ90jhiFgEh2UPSBIU5dzuEz9rzYStMvl-fvY0sUVskrUXSF8rhFUWMVYdBMsfYSwh5aOJdXOo3fzFWJx8-38d9ypcDBc",
      accesorios: "/category-accessories.jpg",
      calzados: "/category-footwear.jpg",
    };

    const sortedCategories = [...categories].sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.slug.toLowerCase());
      const idxB = CATEGORY_ORDER.indexOf(b.slug.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    content = (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {sortedCategories.map((category) => {
          const imageSrc =
            category.image_url ||
            DEFAULT_CATEGORY_IMAGES[category.slug.toLowerCase()] ||
            "/category-accessories.jpg";

          return (
            <Link key={category.id} href="/products" className="group block text-center">
              <div className="relative aspect-3/4 mb-4 overflow-hidden rounded-none bg-[#f4eddf]">
                <Image
                  alt={`Categoría de ${category.name}`}
                  className="object-cover absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
                  src={imageSrc}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="text-[14px] font-semibold uppercase tracking-wider">
                {category.name}
              </h3>
              <p className="text-[12px] font-medium text-[#fff9ed]/70">Colección</p>
            </Link>
          );
        })}
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
            Comprar por Categoría
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
