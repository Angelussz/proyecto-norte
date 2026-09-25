"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductGrid } from "@/features/store/components/product-grid";
import type { ProductCatalogParams } from "@/features/product/types/product-catalog.interface";
import { getProductCatalog } from "@/features/product/services/product-catalog.service";

function mapCategory(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Todas" || trimmed === "todas") return undefined;
  return trimmed.toLowerCase();
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

export default function ProductsPage() {
  const [category, setCategory] = useState("Todas");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMin, setDebouncedMin] = useState("");
  const [debouncedMax, setDebouncedMax] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMin(minPrice), 300);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMax(maxPrice), 300);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  const params: ProductCatalogParams = {
    category: mapCategory(category),
    minPrice: parsePrice(debouncedMin),
    maxPrice: parsePrice(debouncedMax),
    sortBy: mapSortBy(sortBy),
    page: currentPage,
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
    (setter: (value: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-16">
      <h1 className="mb-8 text-center text-2xl font-semibold">
        Productos
      </h1>

      <div className="mb-8 flex flex-wrap gap-3 justify-start">
        <select
          value={category}
          onChange={handleFilterChange(setCategory)}
          className="rounded-md border px-4 py-2 text-sm"
        >
          <option value="Todas">Todas</option>
          <option value="Camisas">Camisas</option>
          <option value="Pantalones">Pantalones</option>
        </select>
        <input
          type="number"
          placeholder="Precio mínimo"
          value={minPrice}
          onChange={handleFilterChange(setMinPrice)}
          className="rounded-md border px-4 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrice}
          onChange={handleFilterChange(setMaxPrice)}
          className="rounded-md border px-4 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={handleFilterChange(setSortBy)}
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
          <p className="text-lg font-medium">
            No se encontraron productos.
          </p>

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

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-md border px-4 py-2 text-sm ${
                  currentPage === page ? "font-bold" : ""
                }`}
              >
                {page}
              </button>
            )
          )}

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