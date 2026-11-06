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
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col w-full">
        <AdminProductsStats />
        <AdminProductsFilters />
        <AdminProductsTable />
        <AdminProductsPagination />
      </div>
    </main>
  );
}
