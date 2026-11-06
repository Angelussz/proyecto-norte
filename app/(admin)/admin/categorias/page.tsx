import type { Metadata } from "next";
import { AdminSizeSystemView } from "@/features/admin/components/admin-size-system-view";

export const metadata: Metadata = {
  title: "Sistema de Talles | NORTE Admin",
  description:
    "Normativas de tallaje oficiales, taxonomía unificada y guía de patronaje para confección artesanal.",
};

export default function AdminSizeSystemPage() {
  return <AdminSizeSystemView />;
}
