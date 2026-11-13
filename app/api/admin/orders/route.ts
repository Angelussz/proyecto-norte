import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminOrdersList } from "@/services/order-admin.service";
import type { OrderStatus } from "@/features/admin-orders/types/admin-order.interface";

/**
 * GET /api/admin/orders
 * Listado paginado y filtrable de órdenes para el panel administrativo.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const { searchParams } = req.nextUrl;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const status = (statusParam || undefined) as OrderStatus | "ALL" | undefined;

    const response = await getAdminOrdersList({
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 10 : limit,
      status,
      search,
      from,
      to,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/orders]");
  }
}
