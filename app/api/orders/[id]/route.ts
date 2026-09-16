import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/features/orders/services/order.service";

/**
 * GET /api/orders/[id]
 * Obtiene una orden por su ID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json(
      { error: "Orden no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}
