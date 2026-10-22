import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  type AdminOrderDetail,
  type AdminOrderFilters,
  type AdminOrderListResponse,
  type AdminOrderSummary,
  type CancelOrderDto,
  type UpdateOrderStatusDto,
  isReasonRequired,
  isValidOrderTransition,
  shouldDefaultRestoreStock,
} from "@/features/admin-orders/types/admin-order.interface";

// ─── Errores de Dominio ───────────────────────────────────────────────────────

export type OrderAdminErrorCode =
  "VALIDATION" | "INVALID_TRANSITION" | "REASON_REQUIRED" | "NOT_FOUND" | "CONFLICT";

export class OrderAdminError extends Error {
  constructor(
    public readonly code: OrderAdminErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OrderAdminError";
  }
}

export const ORDER_ADMIN_STATUS: Record<OrderAdminErrorCode, number> = {
  VALIDATION: 400,
  INVALID_TRANSITION: 400,
  REASON_REQUIRED: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

// ─── Serializadores ──────────────────────────────────────────────────────────

type PrismaOrderDetailWithRelations = Prisma.OrdersGetPayload<{
  include: {
    user: true;
    address: true;
    payment: true;
    fiscal_receipt: true;
    items: {
      include: {
        variant: {
          include: {
            product: true;
          };
        };
      };
    };
  };
}>;

export function serializeAdminOrderDetail(order: PrismaOrderDetailWithRelations): AdminOrderDetail {
  return {
    id: order.id,
    user_id: order.user_id,
    address_id: order.address_id,
    subtotal: Number(order.subtotal),
    shipping_cost: Number(order.shipping_cost),
    total: Number(order.total),
    status: order.status,
    cancel_reason: order.cancel_reason,
    status_notes: order.status_notes,
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
    user: {
      id: order.user.id,
      name: order.user.name,
      last_name: order.user.last_name,
      email: order.user.email,
      phone: order.user.phone,
    },
    address: {
      id: order.address.id,
      recipient: order.address.recipient,
      contact_phone: order.address.contact_phone,
      address_line: order.address.address_line,
      city: order.address.city,
      reference: order.address.reference,
    },
    items: order.items.map((item) => ({
      id: item.id,
      order_id: item.order_id,
      variant_id: item.variant_id,
      sku_snapshot: item.sku_snapshot,
      product_name_snapshot: item.product_name_snapshot,
      unit_price: Number(item.unit_price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      variant: item.variant
        ? {
            id: item.variant.id,
            sku: item.variant.sku,
            size: item.variant.size,
            color: item.variant.color,
            stock: item.variant.stock,
            image_url: item.variant.image_url,
            product: item.variant.product
              ? {
                  id: item.variant.product.id,
                  name: item.variant.product.name,
                  slug: item.variant.product.slug,
                  image_url: item.variant.product.image_url,
                }
              : null,
          }
        : null,
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          amount: Number(order.payment.amount),
          payment_method: order.payment.payment_method,
          gateway: order.payment.gateway,
          gateway_transaction_id: order.payment.gateway_transaction_id,
          voucher_url: order.payment.voucher_url,
          status: order.payment.status,
          rejection_reason: order.payment.rejection_reason,
          paid_at: order.payment.paid_at ? order.payment.paid_at.toISOString() : null,
          created_at: order.payment.created_at.toISOString(),
        }
      : null,
    fiscal_receipt: order.fiscal_receipt
      ? {
          id: order.fiscal_receipt.id,
          voucher_type: order.fiscal_receipt.voucher_type,
          identity_document_type: order.fiscal_receipt.identity_document_type,
          identity_document_number: order.fiscal_receipt.identity_document_number,
          business_name: order.fiscal_receipt.business_name,
          fiscal_address: order.fiscal_receipt.fiscal_address,
          serial_number: order.fiscal_receipt.serial_number,
          fiscal_status: order.fiscal_receipt.fiscal_status,
          authorization_code: order.fiscal_receipt.authorization_code,
          pdf_url: order.fiscal_receipt.pdf_url,
          xml_url: order.fiscal_receipt.xml_url,
          issued_at: order.fiscal_receipt.issued_at.toISOString(),
        }
      : null,
  };
}

// ─── Helpers de Validación ───────────────────────────────────────────────────

/**
 * Valida el timestamp de concurrencia optimista contra la fecha actual en base de datos.
 * Lanza OrderAdminError("VALIDATION") si el formato es inválido,
 * o OrderAdminError("CONFLICT") si las fechas no coinciden exactamente.
 */
export function assertOptimisticConcurrency(
  actualUpdatedAt: Date,
  expectedUpdatedAt: string,
): void {
  const expectedDate = new Date(expectedUpdatedAt);
  if (isNaN(expectedDate.getTime())) {
    throw new OrderAdminError("VALIDATION", "Formato de expectedUpdatedAt inválido");
  }

  if (actualUpdatedAt.getTime() !== expectedDate.getTime()) {
    throw new OrderAdminError(
      "CONFLICT",
      "La orden fue modificada por otro usuario. Por favor recarga los datos.",
    );
  }
}

// ─── Métodos del Servicio ─────────────────────────────────────────────────────

/**
 * Consulta el listado de órdenes con filtros de estado, búsqueda de texto y rango de fechas.
 */
export async function getAdminOrdersList(
  filters: AdminOrderFilters,
): Promise<AdminOrderListResponse> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: Prisma.OrdersWhereInput = {};

  // Filtro por estado
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  // Filtro por rango de fechas
  if (filters.from || filters.to) {
    where.created_at = {};
    if (filters.from) {
      const fromDate = new Date(filters.from);
      if (!isNaN(fromDate.getTime())) {
        where.created_at.gte = fromDate;
      }
    }
    if (filters.to) {
      const toDate = new Date(filters.to);
      if (!isNaN(toDate.getTime())) {
        where.created_at.lte = toDate;
      }
    }
  }

  // Filtro por búsqueda de texto (ID, nombre, apellido, email)
  const query = filters.search?.trim();
  if (query) {
    where.OR = [
      { id: { contains: query, mode: "insensitive" } },
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { last_name: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      include: {
        user: true,
        payment: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.orders.count({ where }),
  ]);

  const summaries: AdminOrderSummary[] = orders.map((o) => ({
    id: o.id,
    subtotal: Number(o.subtotal),
    shipping_cost: Number(o.shipping_cost),
    total: Number(o.total),
    status: o.status,
    cancel_reason: o.cancel_reason,
    status_notes: o.status_notes,
    created_at: o.created_at.toISOString(),
    updated_at: o.updated_at.toISOString(),
    user: {
      id: o.user.id,
      name: o.user.name,
      last_name: o.user.last_name,
      email: o.user.email,
      phone: o.user.phone,
    },
    items_count: o._count.items,
    payment: o.payment
      ? {
          payment_method: o.payment.payment_method,
          gateway: o.payment.gateway,
          status: o.payment.status,
        }
      : null,
  }));

  return {
    data: summaries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Consulta el detalle completo relacional de una orden.
 */
export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail> {
  const order = await prisma.orders.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      payment: true,
      fiscal_receipt: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new OrderAdminError("NOT_FOUND", `Orden con ID "${id}" no encontrada`);
  }

  return serializeAdminOrderDetail(order);
}

/**
 * Actualiza el estado de una orden respetando la máquina de estados
 * y validando control de concurrencia optimista (expectedUpdatedAt).
 */
export async function updateAdminOrderStatus(
  id: string,
  dto: UpdateOrderStatusDto,
): Promise<AdminOrderDetail> {
  if (!dto.status) {
    throw new OrderAdminError("VALIDATION", "El nuevo status es requerido");
  }

  if (!dto.expectedUpdatedAt) {
    throw new OrderAdminError(
      "VALIDATION",
      "expectedUpdatedAt es requerido para el control de concurrencia",
    );
  }

  // Si el destino es CANCELLED, se deriva a la función especializada de cancelación
  if (dto.status === "CANCELLED") {
    return cancelAdminOrder(id, {
      reason: dto.reason || "Cancelado por el administrador",
      expectedUpdatedAt: dto.expectedUpdatedAt,
    });
  }

  const existing = await prisma.orders.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new OrderAdminError("NOT_FOUND", `Orden con ID "${id}" no encontrada`);
  }

  // 1. Control de concurrencia optimista
  assertOptimisticConcurrency(existing.updated_at, dto.expectedUpdatedAt);

  // 2. Validación de transición en máquina de estados
  if (!isValidOrderTransition(existing.status, dto.status)) {
    throw new OrderAdminError(
      "INVALID_TRANSITION",
      `Transición no permitida de "${existing.status}" a "${dto.status}"`,
    );
  }

  // 3. Exigencia de motivo en retrocesos (ej. SHIPPED -> PREPARING)
  if (isReasonRequired(existing.status, dto.status)) {
    if (!dto.reason || !dto.reason.trim()) {
      throw new OrderAdminError(
        "REASON_REQUIRED",
        `Se requiere un motivo obligatorio para cambiar de ${existing.status} a ${dto.status}`,
      );
    }
  }

  const updated = await prisma.orders.update({
    where: { id },
    data: {
      status: dto.status,
      ...(dto.reason?.trim() ? { status_notes: dto.reason.trim() } : {}),
    },
    include: {
      user: true,
      address: true,
      payment: true,
      fiscal_receipt: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  return serializeAdminOrderDetail(updated);
}

/**
 * Cancela una orden de forma atómica y reintegra el inventario según el estado del pedido.
 */
export async function cancelAdminOrder(id: string, dto: CancelOrderDto): Promise<AdminOrderDetail> {
  if (!dto.reason || !dto.reason.trim()) {
    throw new OrderAdminError("REASON_REQUIRED", "El motivo de cancelación es obligatorio");
  }

  if (!dto.expectedUpdatedAt) {
    throw new OrderAdminError(
      "VALIDATION",
      "expectedUpdatedAt es requerido para el control de concurrencia",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.orders.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existing) {
      throw new OrderAdminError("NOT_FOUND", `Orden con ID "${id}" no encontrada`);
    }

    if (existing.status === "DELIVERED" || existing.status === "CANCELLED") {
      throw new OrderAdminError(
        "INVALID_TRANSITION",
        `No se puede cancelar una orden en estado terminal (${existing.status})`,
      );
    }

    // Control de concurrencia optimista
    assertOptimisticConcurrency(existing.updated_at, dto.expectedUpdatedAt);

    // Determinación de reintegro de stock
    const shouldRestore =
      dto.restoreStock !== undefined
        ? dto.restoreStock
        : shouldDefaultRestoreStock(existing.status);

    if (shouldRestore && existing.items.length > 0) {
      for (const item of existing.items) {
        await tx.productVariants.update({
          where: { id: item.variant_id },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    const updated = await tx.orders.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancel_reason: dto.reason.trim(),
      },
      include: {
        user: true,
        address: true,
        payment: true,
        fiscal_receipt: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return serializeAdminOrderDetail(updated);
  });
}
