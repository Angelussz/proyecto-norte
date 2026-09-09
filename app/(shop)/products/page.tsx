"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/store/product-grid";
import { PRODUCTS_MOCK } from "@/lib/mocks";

export default function ProductsPage() {
  const [category, setCategory] = useState("Todas");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const filteredProducts = PRODUCTS_MOCK.filter((product) => {
    const matchesCategory =
      category === "Todas" || product.category === category;

    const matchesMinPrice =
      minPrice === "" || product.price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === "" || product.price <= Number(maxPrice);

    return matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortBy === "price-asc") {
    return a.price - b.price;
  }

  if (sortBy === "price-desc") {
    return b.price - a.price;
  }

  if (sortBy === "name") {
    return a.name.localeCompare(b.name);
  }

  return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = sortedProducts.slice(
  startIndex,
  startIndex + productsPerPage
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-16">
      <h1 className="mb-8 text-center text-2xl font-semibold">
        Productos
      </h1>

      <div className="mb-8 flex flex-wrap gap-3 justify-start">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          onChange={(e) => {
          setMinPrice(e.target.value);
          setCurrentPage(1);
        }}
          className="rounded-md border px-4 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Precio máximo"
          value={maxPrice}
          onChange={(e) => {
          setMaxPrice(e.target.value);
          setCurrentPage(1);
        }}
          className="rounded-md border px-4 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => {
          setSortBy(e.target.value);
          setCurrentPage(1);
        }}
          className="rounded-md border px-4 py-2 text-sm"
        >
        <option value="default">Ordenar por</option>
        <option value="price-asc">Precio: menor a mayor</option>
        <option value="price-desc">Precio: mayor a menor</option>
        <option value="name">Nombre</option>
        <option value="recent">Más recientes</option>
</select>
      </div>

      {sortedProducts.length === 0 ? (
      <div className="py-12 text-center">
      <p className="text-lg font-medium">
        No se encontraron productos.
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Probá cambiando los filtros seleccionados.
      </p>
      </div>
      ) : (
        <ProductGrid products={currentProducts} />
      )}
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
    </main>
  );
}