import dynamic from "next/dynamic";

// ssr: false → el componente sólo se renderiza en el cliente.
// Evita el flash (hydration mismatch) que ocurre cuando el servidor
// renderiza con INITIAL_PRODUCTS y el cliente actualiza desde localStorage.
const AdminInventoryView = dynamic(
  () =>
    import("@/features/admin/components/admin-inventory-view").then((m) => m.AdminInventoryView),
  { ssr: false },
);

export default function AdminInventarioPage() {
  return <AdminInventoryView />;
}
