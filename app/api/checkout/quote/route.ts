import { NextRequest, NextResponse } from "next/server";
import {
  buildCheckoutQuote,
  QuoteHttpError,
} from "@/lib/checkout-quote";

/**
 * POST /api/checkout/quote
 * Cotiza el resumen del pedido a partir del carrito del cliente.
 * Solo calcula: no crea la orden, no descuenta stock ni emite comprobantes.
 * No requiere autenticación.
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
    const data = await buildCheckoutQuote(body);
    return NextResponse.json({ data });
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
      "[POST /api/checkout/quote] Base de datos no disponible:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { error: "No se pudo calcular el resumen del pedido" },
      { status: 500 }
    );
  }
}
