"use client";

import { useState, useMemo } from "react";
import {
  useProducts,
  useDeleteProduct,
  useToggleProductActive,
} from "@/features/admin/hooks/useProducts";
import { AdminProductsStats } from "./admin-products-stats";
import { AdminProductsFilters } from "./admin-products-filters";
import { AdminProductsTable } from "./admin-products-table";
import { AdminProductsPagination } from "./admin-products-pagination";

const PAGE_SIZE = 12;

export function AdminProductsContainer() {
  const { data: products = [], isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleClear = () => {
    setSearch("");
    setFilterCat("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  // Reset page when filters change
  const handleSearchChange = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleCatChange = (v: string) => {
    setFilterCat(v);
    setCurrentPage(1);
  };
  const handleStatusChange = (v: string) => {
    setFilterStatus(v);
    setCurrentPage(1);
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.active).length,
      lowStock: products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length,
      outOfStock: products.filter((p) => p.totalStock === 0).length,
    }),
    [products],
  );

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Search: name or slug
      if (search) {
        const q = search.toLowerCase();
        const matches = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Category: match against categoryName
      if (filterCat) {
        if (!p.categoryName.toLowerCase().includes(filterCat.toLowerCase())) return false;
      }
      // Status: active-based or stock-based
      if (filterStatus === "active" && !p.active) return false;
      if (filterStatus === "in_stock" && p.totalStock <= 5) return false;
      if (filterStatus === "low_stock" && !(p.totalStock >= 1 && p.totalStock <= 5)) return false;
      if (filterStatus === "out_of_stock" && p.totalStock !== 0) return false;

      return true;
    });
  }, [products, search, filterCat, filterStatus]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleActive = (id: string, active: boolean) => {
    toggleActive.mutate({ id, active });
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id);
  };

  return (
    <div className="flex flex-col w-full">
      <AdminProductsStats
        total={kpis.total}
        active={kpis.active}
        lowStock={kpis.lowStock}
        outOfStock={kpis.outOfStock}
        activeFilterStatus={filterStatus}
        onSelectFilterStatus={handleStatusChange}
      />
      <AdminProductsFilters
        search={search}
        onSearchChange={handleSearchChange}
        filterCat={filterCat}
        onCatChange={handleCatChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusChange}
        onClear={handleClear}
      />
      <AdminProductsTable
        products={paginated}
        isLoading={isLoading}
        isError={isError}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        currentPage={safePage}
        totalPages={totalPages}
        total={filtered.length}
        onPage={setCurrentPage}
      />
      <AdminProductsPagination
        currentPage={safePage}
        totalPages={totalPages}
        total={filtered.length}
        onPage={setCurrentPage}
      />
    </div>
  );
}
