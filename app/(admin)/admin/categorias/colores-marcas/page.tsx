import type { Metadata } from "next";
import { AdminColorsBrandsView } from "@/features/admin/components/admin-colors-brands-view";

export const metadata: Metadata = {
  title: "Marcas y Colores | NORTE Admin",
  description: "Gestión de cartas de color, tinturas oficiales y firmas textiles del atelier.",
};

export default function AdminColorsBrandsPage() {
  return <AdminColorsBrandsView />;
}
