import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminDashboardStats } from "@/services/admin-dashboard.service";

/**
 * GET /api/admin/dashboard
 * Estadísticas globales para el panel administrativo.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const stats = await getAdminDashboardStats();

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/dashboard]");
  }
}
