"use client";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminHeader } from "@/features/admin/components/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminHeader />
      <div className="pl-[260px] pt-16">{children}</div>
    </div>
  );
}
