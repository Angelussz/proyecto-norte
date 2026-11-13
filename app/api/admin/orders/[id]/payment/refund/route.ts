import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { createAdminPaymentRefund } from "@/services/payment-admin.service";

/**
 * POST /api/admin/orders/[id]/payment/refund
 * Solicita un reembolso total o parcial de una orden.
 *
 * Body:
 * {
 *   "amount": 25.50, // opcional; si se omite, reembolsa el saldo restante
 *   "reason": "Devolución solicitada por el cliente"
 * }
 *
 * Requiere la cabecera Idempotency-Key para evitar solicitudes duplicadas.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;

    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (!idempotencyKey || idempotencyKey.trim().length === 0 || idempotencyKey.length > 255) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message:
            "La cabecera Idempotency-Key es obligatoria y no puede superar los 255 caracteres",
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El cuerpo de la solicitud debe ser JSON válido",
        },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El cuerpo debe ser un objeto JSON",
        },
        { status: 400 },
      );
    }

    const { amount, reason } = body as {
      amount?: unknown;
      reason?: unknown;
    };

    if (typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El motivo del reembolso es obligatorio",
        },
        { status: 400 },
      );
    }

    if (
      amount !== undefined &&
      (typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001)
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "El importe debe ser positivo, válido y tener como máximo dos decimales",
        },
        { status: 400 },
      );
    }

    const result = await createAdminPaymentRefund({
      orderId: id,
      amount: amount as number | undefined,
      reason: reason.trim(),
      idempotencyKey,
      requestedBy: admin.sub,
    });

    return NextResponse.json(result, {
      status: result.requires_review || result.refund.status === "PROCESSING" ? 202 : 200,
    });
  } catch (error) {
    return handleAdminError(error, "[admin/orders/payment/refund]");
  }
}
