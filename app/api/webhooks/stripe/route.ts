import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

class InsufficientStockError extends Error {
  variantId: string;

  constructor(variantId: string) {
    super(`Stock insuficiente para la variante ${variantId}`);
    this.variantId = variantId;
  }
}

/**
 * POST /api/webhooks/stripe
 * Fuente de verdad del pago. Stripe lo llama con eventos firmados.
 * Suscribir en Dashboard/CLI: payment_intent.succeeded, payment_intent.payment_failed.
 * El frontend (confirmCardPayment) cobra, pero nunca actualiza la DB directamente.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[POST /api/webhooks/stripe] Falta STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook de Stripe no configurado" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Falta la firma de Stripe" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    // El body debe leerse crudo: la firma se verifica sobre los bytes originales.
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json(
      { error: "Firma de Stripe inválida" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handleFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "[POST /api/webhooks/stripe] Error procesando evento:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "No se pudo procesar el evento" },
      { status: 500 }
    );
  }
}

/**
 * Marca la orden PAID + pago APPROVED y descuenta stock en una transacción.
 * Idempotente: si ya está PAID/APPROVED no hace nada (Stripe reintenta eventos).
 */
async function handleSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.warn(
      "[webhook/stripe] payment_intent.succeeded sin metadata.orderId:",
      paymentIntent.id
    );
    return;
  }

  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order) {
    console.warn("[webhook/stripe] Orden no encontrada:", orderId);
    return;
  }
  if (order.status === "PAID" && order.payment?.status === "APPROVED") {
    return;
  }

  // Verificar que lo cobrado coincida con el total validado en servidor.
  const expectedCents = Math.round(Number(order.total) * 100);
  const receivedCents = paymentIntent.amount_received ?? paymentIntent.amount;
  if (receivedCents !== expectedCents) {
    console.error(
      `[webhook/stripe] Monto inconsistente orden ${order.id}: ` +
        `esperado ${expectedCents}, recibido ${receivedCents}`
    );
    await prisma.$transaction([
      prisma.payments.update({
        where: { order_id: order.id },
        data: {
          status: "REJECTED",
          rejection_reason: "Monto cobrado no coincide con el total de la orden",
          gateway_transaction_id: paymentIntent.id,
        },
      }),
      prisma.orders.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      }),
    ]);
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const updated = await tx.productVariants.updateMany({
          where: { id: item.variant_id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new InsufficientStockError(item.variant_id);
        }
      }
      await tx.payments.update({
        where: { order_id: order.id },
        data: {
          status: "APPROVED",
          paid_at: new Date(),
          gateway_transaction_id: paymentIntent.id,
          rejection_reason: null,
        },
      });
      await tx.orders.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      console.error(
        `[webhook/stripe] Stock insuficiente orden ${order.id}:`,
        error.variantId
      );
      await prisma.payments.update({
        where: { order_id: order.id },
        data: {
          status: "REJECTED",
          rejection_reason: "Stock insuficiente al confirmar el pago",
          gateway_transaction_id: paymentIntent.id,
        },
      });
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      // El dinero ya fue capturado: reembolsar manual desde Dashboard Stripe
      // o con stripe.refunds.create({ payment_intent: paymentIntent.id }).
      return;
    }
    throw error;
  }
}

/**
 * Marca el pago REJECTED con el motivo de Stripe.
 * La orden queda PENDING_PAYMENT para reintentar (el cron la lleva a
 * CANCELLED si se abandona). No toca stock.
 */
async function handleFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.warn(
      "[webhook/stripe] payment_intent.payment_failed sin metadata.orderId:",
      paymentIntent.id
    );
    return;
  }

  const payment = await prisma.payments.findUnique({
    where: { order_id: orderId },
  });
  if (!payment) {
    console.warn("[webhook/stripe] Pago no encontrado orden:", orderId);
    return;
  }
  if (payment.status === "APPROVED") {
    return;
  }

  const reason =
    paymentIntent.last_payment_error?.message ??
    "Pago rechazado por Stripe";

  await prisma.payments.update({
    where: { order_id: orderId },
    data: {
      status: "REJECTED",
      rejection_reason: reason,
      gateway_transaction_id: paymentIntent.id,
    },
  });
}
