import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";
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

  const order = await prisma.orders.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Orden no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(serializeOrder(order));
}

/**
 * PATCH /api/orders/[id]
 * Actualiza el status de una orden con control de concurrencia optimista.
 *
 * Body:
 *   status           - nuevo status (requerido)
 *   expectedUpdatedAt - timestamp que el cliente tiene (requerido)
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

  const result = await prisma.orders.updateMany({
    where: {
      id,
      updated_at: new Date(body.expectedUpdatedAt),
    },
    data: { status: normalizedStatus },
  });

  if (result.count === 0) {
    const exists = await prisma.orders.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Conflicto: la orden fue modificada por otro usuario" },
      { status: 409 }
    );
  }

  const updated = await prisma.orders.findUnique({
    where: { id },
    include: { items: true },
  });

  return NextResponse.json({ success: true, order: serializeOrder(updated!) });
}
