import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { handleAdminError } from "@/lib/admin-api";
import { getAdminPaymentsList } from "@/services/payment-admin.service";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

const VALID_STATUSES: PaymentStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const VALID_METHODS: PaymentMethod[] = ["CARD", "TRANSFER", "CASH_ON_DELIVERY"];

/**
 * GET /api/admin/payments
 * Listado paginado y filtrable de pagos para el panel administrativo.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const { searchParams } = req.nextUrl;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const rawStatus = searchParams.get("status");
    const rawMethod = searchParams.get("method");

    const statusParam = rawStatus || undefined;
    const methodParam = rawMethod || undefined;

    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    if (
      statusParam &&
      statusParam !== "ALL" &&
      !VALID_STATUSES.includes(statusParam as PaymentStatus)
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}, ALL`,
        },
        { status: 400 },
      );
    }

    if (
      methodParam &&
      methodParam !== "ALL" &&
      !VALID_METHODS.includes(methodParam as PaymentMethod)
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: `Método de pago inválido. Valores permitidos: ${VALID_METHODS.join(", ")}, ALL`,
        },
        { status: 400 },
      );
    }

    const page = pageParam === null ? 1 : Number(pageParam);
    const limit = limitParam === null ? 10 : Number(limitParam);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "La página debe ser un entero mayor a 0 y el límite debe estar entre 1 y 50.",
        },
        { status: 400 },
      );
    }

    const response = await getAdminPaymentsList({
      page,
      limit,
      status: statusParam as PaymentStatus | "ALL" | undefined,
      method: methodParam as PaymentMethod | "ALL" | undefined,
      search,
      from,
      to,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleAdminError(error, "[admin/payments]");
  }
}
