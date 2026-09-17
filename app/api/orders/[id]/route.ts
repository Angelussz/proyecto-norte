import { NextRequest, NextResponse } from "next/server";
import {
  getOrderById,
  updateOrderStatus,
} from "@/features/orders/services/order.service";
import type { OrderStatus } from "@/generated/prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

/**
 * PATCH /api/orders/[id]
 * Actualiza el status de una orden con control de concurrencia optimista.
 *
 * Body:
 *   status           - nuevo status (requerido)
 *   expectedUpdatedAt - timestamp que el cliente tiene (requerido)
 *
 * Respuestas:
 *   200 → { success: true, order }
 *   400 → { error: "..." }
 *   404 → { error: "Orden no encontrada" }
 *   409 → { error: "Conflicto: la orden fue modificada por otro usuario" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { status?: string; expectedUpdatedAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.status || !body.expectedUpdatedAt) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: status, expectedUpdatedAt" },
      { status: 400 }
    );
  }

  const normalizedStatus = body.status.toUpperCase() as OrderStatus;
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const result = await updateOrderStatus(id, {
    status: normalizedStatus,
    expectedUpdatedAt: body.expectedUpdatedAt,
  });

  if (!result.success) {
    const status = result.error.includes("no encontrada") ? 404 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result);
}
