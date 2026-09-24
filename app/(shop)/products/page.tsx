"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { ProductGrid } from "@/features/store/components/product-grid";
import type { ProductCatalogParams, ProductCatalogResponse } from "@/features/product/types/product-catalog.interface";
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
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState<{
    key: string;
    catalog: ProductCatalogResponse | null;
  }>({ key: "", catalog: null });
  const [error, setError] = useState<{
    key: string;
    message: string;
  } | null>(null);

  const filterKey = JSON.stringify([
    mapCategory(category),
    parsePrice(minPrice),
    parsePrice(maxPrice),
    mapSortBy(sortBy),
    currentPage,
  ]);

  useEffect(() => {
    let cancelled = false;

    const params: ProductCatalogParams = {
      category: mapCategory(category),
      minPrice: parsePrice(minPrice),
      maxPrice: parsePrice(maxPrice),
      sortBy: mapSortBy(sortBy),
      page: currentPage,
    };

    getProductCatalog(params)
      .then((response) => {
        if (!cancelled) {
          setResult({ key: filterKey, catalog: response });
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          console.error("[products-page] Error al cargar el catálogo:", caught);
          setError({
            key: filterKey,
            message:
              "No pudimos cargar los productos. Intentá de nuevo más tarde.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category, minPrice, maxPrice, sortBy, currentPage, filterKey]);

  const currentError =
    error !== null && error.key === filterKey ? error.message : null;
  const loading = result.key !== filterKey;
  const catalog = loading ? null : result.catalog;
  const totalPages = catalog?.pagination.totalPages ?? 0;
  const hasProducts = catalog !== null && catalog.data.length > 0;

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

      {currentError ? (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">{currentError}</p>
        </div>
      ) : loading ? (
        <div className="py-12 text-center">
          <p className="text-lg font-medium">Cargando productos…</p>
        </div>
      ) : hasProducts ? (
        <ProductGrid items={catalog!.data} />
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

      {!loading && totalPages > 1 && (
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
            disabled={currentPage === totalPages}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  );
}