import { AdminProductsHeader } from "@/features/admin/components/admin-products-header";
import { AdminProductsStats } from "@/features/admin/components/admin-products-stats";
import { AdminProductsFilters } from "@/features/admin/components/admin-products-filters";
import { AdminProductsTable } from "@/features/admin/components/admin-products-table";
import { AdminProductsPagination } from "@/features/admin/components/admin-products-pagination";

export const metadata = {
  title: "NORTE Admin — Productos",
  description: "Gestión del catálogo, inventario y variantes.",
};

export default function AdminProductsPage() {
  return (
    <>
      <AdminProductsHeader />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <AdminProductsStats />
          <AdminProductsFilters />
          <AdminProductsTable />
          <AdminProductsPagination />
        </div>
      </main>
    </>
  );
}
