import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Iniciá sesión para consultar tus datos de envío." },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  let userId: string;

  // 1. Validar la sesión por separado.
  try {
    const payload = await verifyToken(token);

    if (typeof payload.sub !== "string" || !payload.sub) {
      return NextResponse.json(
        { error: "La sesión no contiene un usuario válido." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    userId = payload.sub;
  } catch {
    return NextResponse.json(
      { error: "La sesión es inválida o expiró. Iniciá sesión nuevamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // 2. Consultar al usuario y su dirección predeterminada.
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        email: true,
        addresses: {
          where: { is_default: true },
          take: 1,
          select: {
            recipient: true,
            contact_phone: true,
            address_line: true,
            city: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró tu usuario." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const address = user.addresses[0];

    if (!address) {
      return NextResponse.json(
        { error: "No tenés una dirección de envío predeterminada." },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        data: {
          email: user.email,
          name: address.recipient,
          phone: address.contact_phone,
          address: address.address_line,
          city: address.city,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[GET /api/checkout/shipping] Error al consultar el usuario:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "No se pudieron consultar tus datos de envío." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
