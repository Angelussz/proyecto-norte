import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session";
import { getStoreSettings } from "@/lib/store-settings";
import {
  calculateQuoteTotals,
  parseQuoteItems,
  round2,
  toCheckoutItems,
  validateQuoteItems,
  QuoteHttpError,
  type CleanedQuoteItem,
} from "@/lib/checkout-quote";

const CURRENCY = "usd";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// TODO(futuro sprint): expirar órdenes PENDING_PAYMENT abandonadas
// (cron -> CANCELLED) para no acumular intentos sin pago.

function isSameCart(
  details: { variant_id: string; quantity: number }[],
  cleaned: CleanedQuoteItem[],
): boolean {
  if (details.length !== cleaned.length) return false;

  return cleaned.every((item) =>
    details.some(
      (detail) => detail.variant_id === item.variantId && detail.quantity === item.quantity,
    ),
  );
}

/**
 * POST /api/checkout/payment-intent
 * Crea o reutiliza una orden PENDING_PAYMENT y el PaymentIntent en Stripe.
 * Requiere una sesión válida y una dirección de envío predeterminada.
 * No descuenta stock ni emite comprobantes hasta confirmarse el pago.
 *
 * Body: { items: [{ variantId: string, quantity: number }] }
 */
export async function POST(req: NextRequest) {
  // 1) Validar la sesión del usuario.
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Iniciá sesión para realizar la compra." }, { status: 401 });
  }

  let userId: string;

  try {
    const payload = await verifyToken(token);

    if (typeof payload.sub !== "string" || !payload.sub) {
      return NextResponse.json(
        { error: "La sesión no contiene un usuario válido." },
        { status: 401 },
      );
    }

    userId = payload.sub;
  } catch {
    return NextResponse.json(
      {
        error: "La sesión es inválida o expiró. Iniciá sesión nuevamente.",
      },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  try {
    const cleaned = parseQuoteItems(body);

    // 2) Buscar al usuario autenticado y su dirección predeterminada.
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "La sesión no corresponde a un usuario válido." },
        { status: 401 },
      );
    }

    const address = await prisma.address.findFirst({
      where: {
        user_id: user.id,
        is_default: true,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "No tenés una dirección de envío predeterminada." },
        { status: 422 },
      );
    }

    // 3) Validar variantes y calcular los importes en el servidor.
    // Los impuestos se guardan también en la orden.
    const validated = await validateQuoteItems(cleaned);
    const items = toCheckoutItems(validated);
    const settings = await getStoreSettings();

    const { subtotal, shippingCost, taxes, total } = calculateQuoteTotals(items, settings);

    // 4) Reutilizar una orden pendiente del mismo usuario y carrito,
    // o crear una nueva.

    const pendingOrders = await prisma.orders.findMany({
      where: {
        user_id: user.id,
        status: "PENDING_PAYMENT",
      },
      include: {
        items: {
          select: {
            variant_id: true,
            quantity: true,
          },
        },
        payment: {
          select: {
            gateway_transaction_id: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const existing = pendingOrders.find(
      (order) => !order.payment?.gateway_transaction_id && isSameCart(order.items, cleaned),
    );

    const lineItems = validated.map((item) => ({
      variant_id: item.variantId,
      sku_snapshot: item.sku,
      product_name_snapshot: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      subtotal: round2(item.unitPrice * item.quantity),
    }));

    const order = await prisma.$transaction(
      async (tx) => {
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
              taxes,
              total,
            },
          });

          await tx.payments.update({
            where: { order_id: existing.id },
            // Un reintento del mismo carrito reabre el pago.
            data: {
              amount: total,
              status: "PENDING",
              rejection_reason: null,
            },
          });

          return updated;
        }

        const created = await tx.orders.create({
          data: {
            user_id: user.id,
            address_id: address.id,
            subtotal,
            shipping_cost: shippingCost,
            taxes,
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
      },
      {
        timeout: 15000,
      },
    );

    // 5) Crear el PaymentIntent en Stripe usando el total validado.
    // La clave de idempotencia evita duplicar el intento para la misma orden.
    let paymentIntent: Stripe.PaymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(total * 100),
          currency: CURRENCY,
          metadata: { orderId: order.id },
        },
        { idempotencyKey: order.id },
      );
    } catch (stripeError) {
      console.error(
        "[POST /api/checkout/payment-intent] Stripe no disponible:",
        stripeError instanceof Error ? stripeError.message : stripeError,
      );

      return NextResponse.json({ error: "No se pudo iniciar el pago con Stripe" }, { status: 502 });
    }

    if (!paymentIntent.client_secret) {
      return NextResponse.json({ error: "Stripe no devolvió clientSecret" }, { status: 502 });
    }

    await prisma.payments.update({
      where: { order_id: order.id },
      data: {
        gateway_transaction_id: paymentIntent.id,
      },
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
        { status: error.status },
      );
    }

    console.error(
      "[POST /api/checkout/payment-intent] Error inesperado:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
