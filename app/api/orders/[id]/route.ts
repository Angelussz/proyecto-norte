import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session";

/**
 * GET /api/orders/[id]
 * Permite consultar una orden únicamente a su propietario autenticado.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Iniciá sesión para consultar tu orden." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let userId: string;

  try {
    const payload = await verifyToken(token);

    if (typeof payload.sub !== "string" || !payload.sub) {
      return NextResponse.json(
        { error: "La sesión no contiene un usuario válido." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    userId = payload.sub;
  } catch {
    return NextResponse.json(
      { error: "La sesión es inválida o expiró. Iniciá sesión nuevamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
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
