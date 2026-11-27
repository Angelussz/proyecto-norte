import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NO_STORE_HEADERS, requireAccountSession } from "@/lib/account-api";

export async function GET(req: NextRequest) {
  const auth = await requireAccountSession(req);
  if ("errorResponse" in auth) return auth.errorResponse;

  const userId = auth.payload.sub;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json(
      { error: "La sesión no contiene un usuario válido." },
      { status: 401, headers: NO_STORE_HEADERS },
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
