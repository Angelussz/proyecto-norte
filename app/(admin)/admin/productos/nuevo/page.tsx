import type { Metadata } from "next";
import { AdminProductForm } from "@/features/admin/components/admin-product-form";

export const metadata: Metadata = {
  title: "Agregar Producto | NORTE Admin",
  description: "Ingreso de nueva pieza artesanal al catálogo editorial de NORTE Atelier.",
};

export default function NuevoProductoPage() {
  return <AdminProductForm />;
}
