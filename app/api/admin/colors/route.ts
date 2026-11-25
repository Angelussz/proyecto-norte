import { NextResponse } from "next/server";
import { getAllColors, createColor } from "@/features/admin/services/color.service";
import type { CreateColorBody } from "@/features/admin/types/brand-color.interface";

export async function GET() {
  try {
    const colors = await getAllColors();
    return NextResponse.json({ data: colors });
  } catch (error) {
    console.error("[GET /api/admin/colors]", error);
    return NextResponse.json({ error: "Error al obtener los colores." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateColorBody = await req.json();
    if (!body.name || !body.skuCode || !body.hex) {
      return NextResponse.json({ error: "Nombre, SKU y hex son obligatorios." }, { status: 400 });
    }
    const color = await createColor(body);
    return NextResponse.json({ data: color }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/colors]", error);
    return NextResponse.json({ error: "Error al crear el color." }, { status: 500 });
  }
}
