import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminOrderDetail } from "@/services/order-admin.service";

/**
 * GET /api/admin/orders/[id]/payment
 * Consulta el pago y el comprobante fiscal asociados a una orden.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const order = await getAdminOrderDetail(id);

    return NextResponse.json(
      {
        order_id: order.id,
        payment: order.payment,
        fiscal_receipt: order.fiscal_receipt,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleAdminError(error, "[admin/orders/payment]");
  }
}
