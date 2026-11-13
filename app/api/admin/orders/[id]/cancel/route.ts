import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { cancelAdminOrder } from "@/services/order-admin.service";
import type { CancelOrderDto } from "@/features/admin-orders/types/admin-order.interface";

/**
 * POST /api/admin/orders/[id]/cancel
 * Cancela una orden de forma atómica y reintegra el stock correspondiente
 * con control de concurrencia optimista (409 Conflict).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const body = (await req.json().catch(() => null)) as CancelOrderDto | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "VALIDATION", message: "Cuerpo de la petición inválido o ausente" },
        { status: 400 },
      );
    }

    const cancelled = await cancelAdminOrder(id, body);
    return NextResponse.json(cancelled, { status: 200 });
  } catch (error) {
    return handleAdminError(error, `[admin/orders/cancel]`);
  }
}
