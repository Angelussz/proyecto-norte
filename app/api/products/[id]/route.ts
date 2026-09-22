import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.products.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Producto no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}