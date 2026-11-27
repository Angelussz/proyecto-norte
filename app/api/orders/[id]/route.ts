import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";
import { NO_STORE_HEADERS, requireAccountSession } from "@/lib/account-api";

/**
 * GET /api/orders/[id]
 * Permite consultar una orden únicamente a su propietario autenticado.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const userId = auth.payload.sub;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json(
      { error: "La sesión no contiene un usuario válido." },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const { id } = await params;

    const order = await prisma.orders.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.user_id !== userId) {
      return NextResponse.json(
        { error: "Orden no encontrada." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(serializeOrder(order), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "[GET /api/orders/[id]] Error al consultar la orden:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "No se pudo consultar la orden." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
