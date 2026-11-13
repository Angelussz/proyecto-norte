import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminOrderDetail } from "@/services/order-admin.service";

/**
 * GET /api/admin/orders/[id]
 * Detalle completo relacional de una orden para el panel administrativo.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const order = await getAdminOrderDetail(id);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return handleAdminError(error, `[admin/orders/${(await params).id ?? "detail"}]`);
  }
}
