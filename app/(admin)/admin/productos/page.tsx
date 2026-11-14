import { AdminProductsContainer } from "@/features/admin/components/admin-products-container";

export const metadata = {
  title: "NORTE Admin — Productos",
  description: "Gestión del catálogo, inventario y variantes.",
};

export default function AdminProductsPage() {
  return (
    <main className="w-full bg-surface min-h-[calc(100vh-4rem)]">
      <AdminProductsContainer />
    </main>
  );
}
