import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import {
  calculateQuoteTotals,
  parseQuoteItems,
  round2,
  toCheckoutItems,
  validateQuoteItems,
  QuoteHttpError,
  type CleanedQuoteItem,
} from "@/lib/checkout-quote";

// ── Usuario de prueba (temporal hasta que exista auth) ────────────────────
// TEST_USER debe existir en la BD junto a su dirección por defecto
// (seed: Carlos Mendoza <carlos.mendoza@example.com>).
const TEST_USER = { name: "Carlos", last_name: "Mendoza" };

const CURRENCY = "usd";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// TODO(futuro sprint): expirar órdenes PENDING_PAYMENT abandonadas
// (cron -> CANCELLED) para no acumular intentos sin pago.

function isSameCart(
  details: { variant_id: string; quantity: number }[],
  cleaned: CleanedQuoteItem[]
): boolean {
  if (details.length !== cleaned.length) return false;
  return cleaned.every((item) =>
    details.some(
      (detail) =>
        detail.variant_id === item.variantId &&
        detail.quantity === item.quantity
    )
  );
}

/**
 * POST /api/checkout/payment-intent
 * Crea (o reutiliza) la orden en PENDING_PAYMENT y el PaymentIntent en Stripe.
 * No descuenta stock ni emite comprobantes (eso ocurre al confirmarse el pago).
 * Solo debe llamarse al iniciar el pago ("Place Order"), no al cargar la página.
 * No requiere autenticación (usuario de prueba temporal).
 *
 * Body: { items: [{ variantId: string, quantity: number }] }
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido" },
      { status: 400 }
    );
  }

  try {
    const cleaned = parseQuoteItems(body);

    // 1) Usuario + dirección de prueba
    const user = await prisma.users.findFirst({
      where: { name: TEST_USER.name, last_name: TEST_USER.last_name },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario de prueba no encontrado en la base de datos" },
        { status: 422 }
      );
    }
    const address = await prisma.address.findFirst({
      where: { user_id: user.id, is_default: true },
    });
    if (!address) {
      return NextResponse.json(
        { error: "Dirección de prueba no encontrada en la base de datos" },
        { status: 422 }
      );
    }

    // 2) Validar variantes + calcular (misma lógica del quote).
    // Nota: Orders no tiene columna de impuestos; taxes solo vive en el
    // resumen del checkout y en el futuro comprobante fiscal.
    const validated = await validateQuoteItems(cleaned);
    const items = toCheckoutItems(validated);
    const { subtotal, shippingCost, total } = calculateQuoteTotals(items);

    // 3) Reutilizar orden PENDING con el mismo carrito o crear una nueva
    const pendingOrders = await prisma.orders.findMany({
      where: { user_id: user.id, status: "PENDING_PAYMENT" },
      include: {
        items: { select: { variant_id: true, quantity: true } },
      },
      orderBy: { created_at: "desc" },
    });
    const existing = pendingOrders.find((order) =>
      isSameCart(order.items, cleaned)
    );

    const lineItems = validated.map((item) => ({
      variant_id: item.variantId,
      sku_snapshot: item.sku,
      product_name_snapshot: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      subtotal: round2(item.unitPrice * item.quantity),
    }));

    const order = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.orderDetails.deleteMany({
          where: { order_id: existing.id },
        });
        await tx.orderDetails.createMany({
          data: lineItems.map((line) => ({
            ...line,
            order_id: existing.id,
          })),
        });
        const updated = await tx.orders.update({
          where: { id: existing.id },
          data: {
            address_id: address.id,
            subtotal,
            shipping_cost: shippingCost,
            total,
          },
        });
        await tx.payments.update({
          where: { order_id: existing.id },
          // Un reintento del mismo carrito reabre el pago para el nuevo intento.
          data: { amount: total, status: "PENDING", rejection_reason: null },
        });
        return updated;
      }

      const created = await tx.orders.create({
        data: {
          user_id: user.id,
          address_id: address.id,
          subtotal,
          shipping_cost: shippingCost,
          total,
          status: "PENDING_PAYMENT",
        },
      });
      await tx.orderDetails.createMany({
        data: lineItems.map((line) => ({
          ...line,
          order_id: created.id,
        })),
      });
      await tx.payments.create({
        data: {
          order_id: created.id,
          amount: total,
          payment_method: "CARD",
          gateway: "STRIPE",
        },
      });
      return created;
    });

    // 4) PaymentIntent en Stripe con el monto validado en servidor.
    // Idempotency-Key = order.id: reintentar el mismo carrito no duplica
    // el intento en Stripe (devuelve el existente).
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(total * 100),
          currency: CURRENCY,
          metadata: { orderId: order.id },
        },
        { idempotencyKey: order.id }
      );
    } catch (stripeError) {
      console.error(
        "[POST /api/checkout/payment-intent] Stripe no disponible:",
        stripeError instanceof Error ? stripeError.message : stripeError
      );
      return NextResponse.json(
        { error: "No se pudo iniciar el pago con Stripe" },
        { status: 502 }
      );
    }

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Stripe no devolvió clientSecret" },
        { status: 502 }
      );
    }

    await prisma.payments.update({
      where: { order_id: order.id },
      data: { gateway_transaction_id: paymentIntent.id },
    });

    return NextResponse.json({
      data: {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        total,
      },
    });
  } catch (error) {
    if (error instanceof QuoteHttpError) {
      return NextResponse.json(
        {
          error: error.message,
          ...(error.problems ? { problems: error.problems } : {}),
        },
        { status: error.status }
      );
    }

    console.error(
      "[POST /api/checkout/payment-intent] Error inesperado:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { error: "No se pudo iniciar el pago" },
      { status: 500 }
    );
  }
}
