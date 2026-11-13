import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Prisma, type PaymentMethod, type PaymentStatus } from "@/generated/prisma/client";

export type AdminPaymentFilters = {
  page?: number;
  limit?: number;
  status?: PaymentStatus | "ALL";
  method?: PaymentMethod | "ALL";
  search?: string;
  from?: string;
  to?: string;
};

export type PaymentAdminErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "CONFLICT"
  | "STRIPE_ERROR"
  | "REFUND_REQUIRES_REVIEW";

export class PaymentAdminError extends Error {
  constructor(
    public readonly code: PaymentAdminErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PaymentAdminError";
  }
}

export const PAYMENT_ADMIN_STATUS: Record<PaymentAdminErrorCode, number> = {
  VALIDATION: 400,
  NOT_FOUND: 404,
  INVALID_STATE: 409,
  CONFLICT: 409,
  STRIPE_ERROR: 502,
  REFUND_REQUIRES_REVIEW: 202,
};

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const RESERVED_REFUND_STATUSES = ["PENDING", "PROCESSING", "SUCCEEDED", "REQUIRES_REVIEW"] as const;

function toCents(value: number): number {
  return Math.round(value * 100);
}

function formatRefund(refund: {
  id: string;
  payment_id: string;
  amount: { toString(): string };
  reason: string;
  status: string;
  stripe_refund_id: string | null;
  created_at: Date;
  completed_at: Date | null;
}) {
  return {
    id: refund.id,
    payment_id: refund.payment_id,
    amount: Number(refund.amount),
    reason: refund.reason,
    status: refund.status,
    stripe_refund_id: refund.stripe_refund_id,
    created_at: refund.created_at.toISOString(),
    completed_at: refund.completed_at?.toISOString() ?? null,
  };
}

export async function getAdminPaymentsList(filters: AdminPaymentFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const where: {
    status?: PaymentStatus;
    payment_method?: PaymentMethod;
    created_at?: { gte?: Date; lte?: Date };
    OR?: Array<
      | { id: { contains: string; mode: "insensitive" } }
      | { order_id: { contains: string; mode: "insensitive" } }
      | { gateway_transaction_id: { contains: string; mode: "insensitive" } }
      | { order: { user: { name: { contains: string; mode: "insensitive" } } } }
      | { order: { user: { last_name: { contains: string; mode: "insensitive" } } } }
      | { order: { user: { email: { contains: string; mode: "insensitive" } } } }
    >;
  } = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.method && filters.method !== "ALL") {
    where.payment_method = filters.method;
  }

  if (filters.from || filters.to) {
    where.created_at = {};

    const isValidDateFormat = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(new Date(`${value}T00:00:00`).getTime()) &&
      new Date(`${value}T00:00:00`).toISOString().slice(0, 10) === value;

    if (filters.from) {
      if (!isValidDateFormat(filters.from)) {
        throw new PaymentAdminError("VALIDATION", "Fecha inicial inválida");
      }

      where.created_at.gte = new Date(`${filters.from}T00:00:00`);
    }

    if (filters.to) {
      if (!isValidDateFormat(filters.to)) {
        throw new PaymentAdminError("VALIDATION", "Fecha final inválida");
      }

      const toDate = new Date(`${filters.to}T23:59:59.999`);
      where.created_at.lte = toDate;
    }

    if (
      where.created_at.gte &&
      where.created_at.lte &&
      where.created_at.gte > where.created_at.lte
    ) {
      throw new PaymentAdminError(
        "VALIDATION",
        "La fecha inicial no puede ser posterior a la fecha final",
      );
    }
  }
  const search = filters.search?.trim();

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { order_id: { contains: search, mode: "insensitive" } },
      { gateway_transaction_id: { contains: search, mode: "insensitive" } },
      { order: { user: { name: { contains: search, mode: "insensitive" } } } },
      { order: { user: { last_name: { contains: search, mode: "insensitive" } } } },
      { order: { user: { email: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [payments, total] = await Promise.all([
    prisma.payments.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.payments.count({ where }),
  ]);

  return {
    data: payments.map((payment) => ({
      id: payment.id,
      order_id: payment.order_id,
      amount: Number(payment.amount),
      payment_method: payment.payment_method,
      gateway: payment.gateway,
      gateway_transaction_id: payment.gateway_transaction_id,
      voucher_url: payment.voucher_url,
      status: payment.status,
      rejection_reason: payment.rejection_reason,
      paid_at: payment.paid_at?.toISOString() ?? null,
      created_at: payment.created_at.toISOString(),
      order: {
        id: payment.order.id,
        status: payment.order.status,
        total: Number(payment.order.total),
        created_at: payment.order.created_at.toISOString(),
        user: payment.order.user,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

type CreateRefundInput = {
  orderId: string;
  amount?: number;
  reason: string;
  idempotencyKey: string;
  requestedBy: string;
};

export async function createAdminPaymentRefund(input: CreateRefundInput) {
  const reason = input.reason.trim();
  const idempotencyKey = input.idempotencyKey.trim();

  if (!input.orderId.trim()) {
    throw new PaymentAdminError("VALIDATION", "El ID de la orden es obligatorio");
  }

  if (!reason || reason.length > 500) {
    throw new PaymentAdminError(
      "VALIDATION",
      "El motivo es obligatorio y no puede superar los 500 caracteres",
    );
  }

  if (!idempotencyKey || idempotencyKey.length > 255 || !input.requestedBy.trim()) {
    throw new PaymentAdminError(
      "VALIDATION",
      "Falta una clave de idempotencia o el administrador solicitante",
    );
  }

  if (
    input.amount !== undefined &&
    (!Number.isFinite(input.amount) ||
      input.amount <= 0 ||
      Math.abs(input.amount * 100 - Math.round(input.amount * 100)) > 0.000001)
  ) {
    throw new PaymentAdminError(
      "VALIDATION",
      "El importe debe ser positivo y tener como máximo dos decimales",
    );
  }

  // Si la clave ya existe, no volvemos a enviar otra devolución a Stripe.
  const previousRefund = await prisma.paymentRefunds.findUnique({
    where: { idempotency_key: idempotencyKey },
  });

  if (previousRefund) {
    const previousPayment = await prisma.payments.findUnique({
      where: { id: previousRefund.payment_id },
      select: { order_id: true },
    });

    if (
      previousPayment?.order_id !== input.orderId ||
      (input.amount !== undefined &&
        toCents(input.amount) !== toCents(Number(previousRefund.amount))) ||
      reason !== previousRefund.reason
    ) {
      throw new PaymentAdminError(
        "CONFLICT",
        "La clave de idempotencia ya fue utilizada con otros datos",
      );
    }

    return {
      refund: formatRefund(previousRefund),
      repeated_request: true,
      requires_review:
        previousRefund.status === "REQUIRES_REVIEW" || previousRefund.status === "PROCESSING",
    };
  }

  // Reservamos el importe dentro de una transacción serializable.
  let refund;

  try {
    refund = await prisma.$transaction(
      async (tx) => {
        const payment = await tx.payments.findUnique({
          where: { order_id: input.orderId },
          include: { refunds: true },
        });

        if (!payment) {
          throw new PaymentAdminError("NOT_FOUND", "No se encontró un pago asociado a la orden");
        }

        if (payment.status !== "APPROVED") {
          throw new PaymentAdminError("INVALID_STATE", "Solo se pueden devolver pagos aprobados");
        }

        if (
          payment.gateway !== "STRIPE" ||
          !payment.gateway_transaction_id ||
          !payment.gateway_transaction_id.startsWith("pi_")
        ) {
          throw new PaymentAdminError(
            "INVALID_STATE",
            "El pago no tiene un PaymentIntent válido de Stripe",
          );
        }

        const paymentCents = toCents(Number(payment.amount));

        const reservedCents = payment.refunds
          .filter((item) =>
            RESERVED_REFUND_STATUSES.includes(
              item.status as (typeof RESERVED_REFUND_STATUSES)[number],
            ),
          )
          .reduce((sum, item) => sum + toCents(Number(item.amount)), 0);

        const availableCents = paymentCents - reservedCents;
        const requestedCents = input.amount === undefined ? availableCents : toCents(input.amount);

        if (availableCents <= 0) {
          throw new PaymentAdminError(
            "CONFLICT",
            "El pago ya fue devuelto completamente o tiene devoluciones pendientes de revisión",
          );
        }

        if (requestedCents <= 0 || requestedCents > availableCents) {
          throw new PaymentAdminError(
            "VALIDATION",
            `El importe supera el saldo disponible de US$ ${(availableCents / 100).toFixed(2)}`,
          );
        }

        return tx.paymentRefunds.create({
          data: {
            payment_id: payment.id,
            amount: requestedCents / 100,
            reason,
            status: "PENDING",
            idempotency_key: idempotencyKey,
            requested_by: input.requestedBy,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 10000,
      },
    );
  } catch (error) {
    if (error instanceof PaymentAdminError) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new PaymentAdminError(
        "CONFLICT",
        "Otra solicitud está procesando una devolución para este pago. Intentá nuevamente.",
      );
    }

    // Si otra solicitud ganó la carrera con la misma clave, recuperamos su registro.
    const existing = await prisma.paymentRefunds.findUnique({
      where: { idempotency_key: idempotencyKey },
    });

    if (existing) {
      const existingPayment = await prisma.payments.findUnique({
        where: { id: existing.payment_id },
        select: { order_id: true },
      });

      if (
        existingPayment?.order_id === input.orderId &&
        reason === existing.reason &&
        (input.amount === undefined || toCents(input.amount) === toCents(Number(existing.amount)))
      ) {
        return {
          refund: formatRefund(existing),
          repeated_request: true,
          requires_review:
            existing.status === "REQUIRES_REVIEW" || existing.status === "PROCESSING",
        };
      }

      throw new PaymentAdminError("CONFLICT", "La clave de idempotencia ya está siendo utilizada");
    }

    throw error;
  }

  // Marcamos el registro como PROCESSING antes de llamar al proveedor.
  await prisma.paymentRefunds.update({
    where: { id: refund.id },
    data: { status: "PROCESSING" },
  });

  try {
    const payment = await prisma.payments.findUnique({
      where: { id: refund.payment_id },
      select: { gateway_transaction_id: true },
    });

    if (!payment?.gateway_transaction_id) {
      throw new PaymentAdminError(
        "INVALID_STATE",
        "No se encontró el identificador del pago en Stripe",
      );
    }

    const stripeRefund = await stripe.refunds.create(
      {
        payment_intent: payment.gateway_transaction_id,
        amount: toCents(Number(refund.amount)),
        metadata: {
          internal_refund_id: refund.id,
          reason,
          order_id: input.orderId,
        },
      },
      {
        idempotencyKey: `norte-refund-${refund.id}`,
      },
    );

    const refundStatus =
      stripeRefund.status === "succeeded"
        ? "SUCCEEDED"
        : stripeRefund.status === "pending"
          ? "PROCESSING"
          : "REQUIRES_REVIEW";

    const updatedRefund = await prisma.paymentRefunds.update({
      where: { id: refund.id },
      data: {
        status: refundStatus,
        stripe_refund_id: stripeRefund.id,
        completed_at: refundStatus === "SUCCEEDED" ? new Date() : null,
        error_message:
          refundStatus === "REQUIRES_REVIEW"
            ? "Stripe devolvió un estado de reembolso que requiere revisión manual."
            : null,
      },
    });

    return {
      refund: formatRefund(updatedRefund),
      repeated_request: false,
      requires_review: refundStatus === "REQUIRES_REVIEW",
    };
  } catch (error) {
    if (error instanceof PaymentAdminError) {
      await prisma.paymentRefunds.update({
        where: { id: refund.id },
        data: {
          status: "FAILED",
          error_message: error.message,
        },
      });

      throw error;
    }

    // Los errores definitivos indican que Stripe rechazó la solicitud.
    // Los errores de comunicación o respuestas inciertas requieren revisión.
    const definitiveFailure =
      error instanceof Stripe.errors.StripeInvalidRequestError ||
      error instanceof Stripe.errors.StripePermissionError ||
      error instanceof Stripe.errors.StripeAuthenticationError;

    const message = definitiveFailure
      ? "Stripe rechazó la solicitud de reembolso"
      : "No se pudo confirmar el resultado del reembolso. Requiere revisión manual.";

    const updatedRefund = await prisma.paymentRefunds.update({
      where: { id: refund.id },
      data: {
        status: definitiveFailure ? "FAILED" : "REQUIRES_REVIEW",
        error_message: message,
      },
    });

    if (definitiveFailure) {
      throw new PaymentAdminError("STRIPE_ERROR", "Stripe rechazó la solicitud de reembolso");
    }

    return {
      refund: formatRefund(updatedRefund),
      repeated_request: false,
      requires_review: true,
    };
  }
}
