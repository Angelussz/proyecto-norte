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
const DEFAULT_ITEMS = 12;
const MIN_PAGE = 1;
const MAX_LIMIT = 48;

/**
 * GET /api/orders
 * Listado paginado de órdenes con filtro opcional por status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawLimit = Number(searchParams.get("limit") ?? "12");
  const page = isNaN(rawPage) ? MIN_PAGE : Math.max(MIN_PAGE, rawPage);
  const limit = isNaN(rawLimit) ? DEFAULT_ITEMS : Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  const statusParam = searchParams.get("status");

  let status: OrderStatus | undefined;
  if (statusParam) {
    const normalized = statusParam.toUpperCase() as OrderStatus;
    if (VALID_STATUSES.includes(normalized)) {
      status = normalized;
    }
  }

  const where = status ? { status } : {};
  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      include: { items: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.orders.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map(serializeOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}
