import { NextResponse } from "next/server";
import { getBrandById, updateBrand, deleteBrand } from "@/features/admin/services/brand.service";
import type { UpdateBrandBody } from "@/features/admin/types/brand-color.interface";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const brand = await getBrandById(id);
    if (!brand) return NextResponse.json({ error: "Marca no encontrada." }, { status: 404 });
    return NextResponse.json({ data: brand });
  } catch (error) {
    console.error("[GET /api/admin/brands/:id]", error);
    return NextResponse.json({ error: "Error al obtener la marca." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body: UpdateBrandBody = await req.json();
    const brand = await updateBrand(id, body);
    return NextResponse.json({ data: brand });
  } catch (error) {
    console.error("[PUT /api/admin/brands/:id]", error);
    return NextResponse.json({ error: "Error al actualizar la marca." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteBrand(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al eliminar la marca.";
    console.error("[DELETE /api/admin/brands/:id]", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
