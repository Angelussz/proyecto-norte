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

class PaymentAlreadyProcessedError extends Error {
  constructor() {
    super("El pago o la orden ya fueron procesados");
  }
}

/**
 * POST /api/webhooks/stripe
 * Fuente de verdad del pago. Stripe lo llama con eventos firmados.
 * Suscribir: payment_intent.succeeded, payment_intent.payment_failed.
 * El frontend cobra, pero nunca actualiza el estado del pago directamente.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[POST /api/webhooks/stripe] Falta STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook de Stripe no configurado" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Stripe verifica la firma sobre el body original.
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma de Stripe inválida" }, { status: 400 });
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
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ error: "No se pudo procesar el evento" }, { status: 500 });
  }
}

/**
 * Aprueba el pago y descuenta el stock dentro de una transacción.
 * Comprueba el PaymentIntent registrado y evita procesar dos veces la orden.
 */
async function handleSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.warn(
      "[webhook/stripe] payment_intent.succeeded sin metadata.orderId:",
      paymentIntent.id,
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

  if (order.payment?.gateway_transaction_id !== paymentIntent.id) {
    console.error(
      `[webhook/stripe] PaymentIntent no coincide con el pago de la orden ${order.id}:`,
      paymentIntent.id,
    );
    return;
  }

  // Verificar que lo cobrado coincida con el total validado en servidor.
  const expectedCents = Math.round(Number(order.total) * 100);
  const receivedCents = paymentIntent.amount_received ?? paymentIntent.amount;

  if (receivedCents !== expectedCents) {
    console.error(
      `[webhook/stripe] Monto inconsistente orden ${order.id}: ` +
        `esperado ${expectedCents}, recibido ${receivedCents}`,
    );

    await prisma
      .$transaction(async (tx) => {
        const paymentUpdate = await tx.payments.updateMany({
          where: {
            order_id: order.id,
            gateway_transaction_id: paymentIntent.id,
            status: { not: "APPROVED" },
          },
          data: {
            status: "REJECTED",
            rejection_reason: "Monto cobrado no coincide con el total de la orden",
          },
        });

        if (paymentUpdate.count !== 1) {
          throw new PaymentAlreadyProcessedError();
        }

        const orderUpdate = await tx.orders.updateMany({
          where: {
            id: order.id,
            status: "PENDING_PAYMENT",
          },
          data: { status: "CANCELLED" },
        });

        if (orderUpdate.count !== 1) {
          throw new PaymentAlreadyProcessedError();
        }
      })
      .catch((error) => {
        if (error instanceof PaymentAlreadyProcessedError) {
          return;
        }
        throw error;
      });

    // Si Stripe capturó un importe incorrecto, revisar el pago en Dashboard.
    // Puede ser necesario realizar un reembolso manual.
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Reclamar el pago condicionalmente antes de tocar el stock.
      const paymentUpdate = await tx.payments.updateMany({
        where: {
          order_id: order.id,
          gateway_transaction_id: paymentIntent.id,
          status: { not: "APPROVED" },
        },
        data: {
          status: "APPROVED",
          paid_at: new Date(),
          rejection_reason: null,
        },
      });

      if (paymentUpdate.count !== 1) {
        throw new PaymentAlreadyProcessedError();
      }

      // Solo una transacción puede cambiar la orden pendiente a pagada.
      const orderUpdate = await tx.orders.updateMany({
        where: {
          id: order.id,
          status: "PENDING_PAYMENT",
        },
        data: { status: "PAID" },
      });

      if (orderUpdate.count !== 1) {
        throw new PaymentAlreadyProcessedError();
      }

      // Todo el descuento se revierte si falla algún artículo.
      for (const item of order.items) {
        const updated = await tx.productVariants.updateMany({
          where: {
            id: item.variant_id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new InsufficientStockError(item.variant_id);
        }
      }
    });
  } catch (error) {
    if (error instanceof PaymentAlreadyProcessedError) {
      return;
    }

    if (error instanceof InsufficientStockError) {
      console.error(`[webhook/stripe] Stock insuficiente orden ${order.id}:`, error.variantId);

      // La transacción anterior se revierte; actualizar solo si el pago
      // y la orden siguen correspondiendo a este intento.
      await prisma
        .$transaction(async (tx) => {
          const paymentUpdate = await tx.payments.updateMany({
            where: {
              order_id: order.id,
              gateway_transaction_id: paymentIntent.id,
              status: "PENDING",
            },
            data: {
              status: "REJECTED",
              rejection_reason: "Stock insuficiente al confirmar el pago",
            },
          });

          if (paymentUpdate.count !== 1) {
            throw new PaymentAlreadyProcessedError();
          }

          const orderUpdate = await tx.orders.updateMany({
            where: {
              id: order.id,
              status: "PENDING_PAYMENT",
            },
            data: { status: "CANCELLED" },
          });

          if (orderUpdate.count !== 1) {
            throw new PaymentAlreadyProcessedError();
          }
        })
        .catch((updateError) => {
          if (updateError instanceof PaymentAlreadyProcessedError) {
            return;
          }
          throw updateError;
        });

      // El dinero podría haberse capturado: revisar Stripe y reembolsar
      // manualmente si corresponde.
      return;
    }

    throw error;
  }
}

/**
 * Marca el pago como REJECTED cuando Stripe informa un intento fallido.
 * No modifica órdenes ya pagadas ni pagos pertenecientes a otro intento.
 */
async function handleFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.warn(
      "[webhook/stripe] payment_intent.payment_failed sin metadata.orderId:",
      paymentIntent.id,
    );
    return;
  }

  const reason = paymentIntent.last_payment_error?.message ?? "Pago rechazado por Stripe";

  const result = await prisma.payments.updateMany({
    where: {
      order_id: orderId,
      gateway_transaction_id: paymentIntent.id,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
      rejection_reason: reason,
    },
  });

  if (result.count === 0) {
    console.info(
      "[webhook/stripe] Evento de fallo ignorado: pago ya procesado o intento distinto.",
      paymentIntent.id,
    );
  }
}
