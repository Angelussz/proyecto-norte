import type { AdminDashboardStats } from "@/features/admin-dashboard/types/admin-dashboard.interface";

/**
 * Consulta las estadísticas globales del panel administrativo.
 */
export async function fetchAdminDashboardStats(signal?: AbortSignal): Promise<AdminDashboardStats> {
  const res = await fetch("/api/admin/dashboard", {
    method: "GET",
    signal,
    credentials: "same-origin",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener estadísticas del dashboard (${res.status})`);
  }

  return (await res.json()) as AdminDashboardStats;
}
