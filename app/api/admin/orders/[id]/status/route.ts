import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { updateAdminOrderStatus } from "@/services/order-admin.service";
import type { UpdateOrderStatusDto } from "@/features/admin-orders/types/admin-order.interface";

/**
 * PATCH /api/admin/orders/[id]/status
 * Actualiza el estado de una orden validando transiciones de la máquina de estados
 * y control de concurrencia optimista (409 Conflict).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const body = (await req.json().catch(() => null)) as UpdateOrderStatusDto | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "VALIDATION", message: "Cuerpo de la petición inválido o ausente" },
        { status: 400 },
      );
    }

    const updated = await updateAdminOrderStatus(id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleAdminError(error, `[admin/orders/status]`);
  }
}
