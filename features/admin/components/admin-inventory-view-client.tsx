"use client";

import dynamic from "next/dynamic";

// dynamic + ssr:false sólo puede vivir en un Client Component (App Router).
// Este wrapper client-only importa AdminInventoryView sin SSR para evitar
// el flash (hydration mismatch) que ocurre al leer localStorage en el
// useState initializer mientras el server renderiza con INITIAL_PRODUCTS.
const AdminInventoryView = dynamic(
  () =>
    import("@/features/admin/components/admin-inventory-view").then((m) => m.AdminInventoryView),
  { ssr: false },
);

export function AdminInventoryViewClient() {
  return <AdminInventoryView />;
}
