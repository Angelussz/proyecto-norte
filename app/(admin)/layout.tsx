"use client";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <div className="pl-[260px]">{children}</div>
    </div>
  );
}
