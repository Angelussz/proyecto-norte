import { prisma } from "@/lib/prisma";
import type {
  ColorDto,
  CreateColorBody,
  UpdateColorBody,
} from "@/features/admin/types/brand-color.interface";

function mapColor(c: {
  id: string;
  name: string;
  sku_code: string;
  hex: string;
  active: boolean;
  sort_order: number;
}): ColorDto {
  return {
    id: c.id,
    name: c.name,
    skuCode: c.sku_code,
    hex: c.hex,
    active: c.active,
    sortOrder: c.sort_order,
    assignedItems: 0,
  };
}

export async function getAllColors(): Promise<ColorDto[]> {
  const colors = await prisma.color.findMany({
    orderBy: { sort_order: "asc" },
  });
  return colors.map(mapColor);
}

export async function getColorById(id: string): Promise<ColorDto | null> {
  const color = await prisma.color.findUnique({ where: { id } });
  return color ? mapColor(color) : null;
}

export async function createColor(body: CreateColorBody): Promise<ColorDto> {
  const count = await prisma.color.count();
  const color = await prisma.color.create({
    data: {
      name: body.name.trim(),
      sku_code: body.skuCode.toUpperCase().trim().slice(0, 3),
      hex: body.hex,
      active: body.active ?? true,
      sort_order: count,
    },
  });
  return mapColor(color);
}

export async function updateColor(id: string, body: UpdateColorBody): Promise<ColorDto> {
  const color = await prisma.color.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.skuCode !== undefined && {
        sku_code: body.skuCode.toUpperCase().trim().slice(0, 3),
      }),
      ...(body.hex !== undefined && { hex: body.hex }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });
  return mapColor(color);
}

export async function deleteColor(id: string): Promise<void> {
  const color = await prisma.color.findUnique({ where: { id } });
  if (!color) throw new Error("Color no encontrado.");
  await prisma.color.delete({ where: { id } });
}
