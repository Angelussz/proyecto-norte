import type { Metadata } from "next";
import { AdminEditProductForm } from "@/features/admin/components/admin-edit-product-form";

export const metadata: Metadata = {
  title: "Editar Producto | NORTE Admin",
  description: "Edición de pieza artesanal del catálogo editorial de NORTE Atelier.",
};

export default function EditarProductoPage() {
  return <AdminEditProductForm />;
}
