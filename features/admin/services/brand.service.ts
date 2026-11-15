import { prisma } from "@/lib/prisma";
import type {
  BrandDto,
  CreateBrandBody,
  UpdateBrandBody,
} from "@/features/admin/types/brand-color.interface";

function mapBrand(b: {
  id: string;
  name: string;
  sku_prefix: string;
  description: string | null;
  icon_color: string;
  locked: boolean;
  active: boolean;
  sort_order: number;
}): BrandDto {
  return {
    id: b.id,
    name: b.name,
    skuPrefix: b.sku_prefix,
    description: b.description,
    iconColor: b.icon_color,
    locked: b.locked,
    active: b.active,
    sortOrder: b.sort_order,
    assignedItems: 0,
  };
}

export async function getAllBrands(): Promise<BrandDto[]> {
  const brands = await prisma.brand.findMany({
    orderBy: { sort_order: "asc" },
  });
  return brands.map(mapBrand);
}

export async function getBrandById(id: string): Promise<BrandDto | null> {
  const brand = await prisma.brand.findUnique({ where: { id } });
  return brand ? mapBrand(brand) : null;
}

export async function createBrand(body: CreateBrandBody): Promise<BrandDto> {
  const count = await prisma.brand.count();
  const brand = await prisma.brand.create({
    data: {
      name: body.name.toUpperCase().trim(),
      sku_prefix: body.skuPrefix.toUpperCase().trim().slice(0, 3),
      description: body.description ?? null,
      icon_color: body.iconColor ?? "secondary",
      active: body.active ?? true,
      sort_order: count,
    },
  });
  return mapBrand(brand);
}

export async function updateBrand(id: string, body: UpdateBrandBody): Promise<BrandDto> {
  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.toUpperCase().trim() }),
      ...(body.skuPrefix !== undefined && {
        sku_prefix: body.skuPrefix.toUpperCase().trim().slice(0, 3),
      }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.iconColor !== undefined && { icon_color: body.iconColor }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });
  return mapBrand(brand);
}

export async function deleteBrand(id: string): Promise<void> {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new Error("Marca no encontrada.");
  await prisma.brand.delete({ where: { id } });
}
