import type { Metadata } from "next";
import { AdminCategoriesView } from "@/features/admin/components/admin-categories-view";

export const metadata: Metadata = {
  title: "Categorías y Atributos | NORTE Admin",
  description:
    "Gestión unificada del catálogo textil del atelier: jerarquías de categorías y parametrización de talles.",
};

export default function AdminCategoriasPage() {
  return <AdminCategoriesView />;
}
