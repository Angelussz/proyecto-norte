import { NextResponse } from "next/server";
import { getAllBrands, createBrand } from "@/features/admin/services/brand.service";
import type { CreateBrandBody } from "@/features/admin/types/brand-color.interface";

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ data: brands });
  } catch (error) {
    console.error("[GET /api/admin/brands]", error);
    return NextResponse.json({ error: "Error al obtener las marcas." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: CreateBrandBody = await req.json();
    if (!body.name || !body.skuPrefix) {
      return NextResponse.json({ error: "Nombre y SKU son obligatorios." }, { status: 400 });
    }
    const brand = await createBrand(body);
    return NextResponse.json({ data: brand }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/brands]", error);
    return NextResponse.json({ error: "Error al crear la marca." }, { status: 500 });
  }
}
