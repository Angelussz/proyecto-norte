"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductGrid } from "@/features/store/components/product-grid";
import type { ProductCatalogParams } from "@/features/product/types/product-catalog.interface";
import { getProductCatalog } from "@/features/product/services/product-catalog.service";
import { useCategories } from "@/features/category/hooks/useCategories";
import { Search, X } from "lucide-react";

function mapCategory(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "todas" || trimmed === "all") return undefined;
  return trimmed;
}

function parsePrice(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

function mapSortBy(value: string): ProductCatalogParams["sortBy"] {
  switch (value) {
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    case "name":
      return "name_asc";
    case "default":
    case "recent":
    default:
      return "newest";
  }
}

function ProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoriesData } = useCategories();

  // Inicializar search y category desde URL (?q=... & ?category=...)
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category")?.toLowerCase() ?? "todas");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMin, setDebouncedMin] = useState("");
  const [debouncedMax, setDebouncedMax] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Sincronizar state cuando cambia la URL externamente (ej: navbar o click en categoría) ──
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    const urlCat = searchParams.get("category")?.toLowerCase() ?? "todas";
    setSearch(urlQ);
    setDebouncedSearch(urlQ);
    setCategory(urlCat);
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce para búsqueda por texto (cuando el usuario escribe en el input de la página)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMin(minPrice), 300);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMax(maxPrice), 300);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  // Sincronizar URL con búsqueda y categoría
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (category && category !== "todas") params.set("category", category);
    const qs = params.toString();
    const nextUrl = `/products${qs ? `?${qs}` : ""}`;
    const currentQs = searchParams.toString();
    const currentUrl = `/products${currentQs ? `?${currentQs}` : ""}`;
    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [debouncedSearch, category, router, searchParams]);

  const params: ProductCatalogParams = {
    category: mapCategory(category),
    minPrice: parsePrice(debouncedMin),
    maxPrice: parsePrice(debouncedMax),
    sortBy: mapSortBy(sortBy),
    page: currentPage,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, isPlaceholderData, isFetching } = useQuery({
    queryKey: ["product-catalog", params],
    queryFn: ({ signal }) => getProductCatalog(params, { signal }),
    placeholderData: keepPreviousData,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.cancelQueries({
      predicate: (query) =>
        query.queryKey[0] === "product-catalog" &&
        !query.isActive() &&
        query.state.fetchStatus === "fetching",
    });
  }, [category, debouncedMin, debouncedMax, sortBy, currentPage, queryClient]);

  const totalPages = data?.pagination.totalPages ?? 0;
  const hasProducts = (data?.data.length ?? 0) > 0;
  const refreshing = isFetching && isPlaceholderData;

  const handleFilterChange =
    (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-16">
      <h1 className="font-headline text-3xl md:text-5xl uppercase leading-none text-foreground sm:text-[80px] mb-4">
        Productos
      </h1>

      <div className="mb-8 flex flex-wrap gap-3 justify-start">
        {/* Campo de búsqueda por texto */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar productos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            suppressHydrationWarning
            className="rounded-md border pl-9 pr-8 py-2 text-sm w-52"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <select
          value={category}
          onChange={handleFilterChange(setCategory)}
          suppressHydrationWarning
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="todas">Todas</option>
          {(categoriesData ?? []).map((cat) => (
            <option key={cat.id} value={cat.slug.toLowerCase()}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio mínimo"
          value={minPrice}
          onChange={handleFilterChange(setMinPrice)}
          suppressHydrationWarning
          className="rounded-md border px-4 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrice}
          onChange={handleFilterChange(setMaxPrice)}
          suppressHydrationWarning
          className="rounded-md border px-4 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={handleFilterChange(setSortBy)}
          suppressHydrationWarning
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="default">Ordenar por</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name">Nombre</option>
          <option value="recent">Más recientes</option>
        </select>
      </div>

      {isError ? (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">
            No pudimos cargar los productos. Intentá de nuevo más tarde.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">Cargando productos…</p>
        </div>
      ) : hasProducts ? (
        <div>
          {refreshing && (
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Actualizando resultados…
            </p>
          )}
          <ProductGrid items={data!.data} />
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">No se encontraron productos.</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Probá cambiando los filtros seleccionados.
          </p>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-md border px-4 py-2 text-sm ${
                currentPage === page ? "font-bold" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}
