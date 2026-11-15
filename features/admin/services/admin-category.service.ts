/**
 * features/admin/services/admin-category.service.ts
 *
 * Lógica Prisma pura para CRUD de categorías en el panel admin.
 * Mismo patrón que size-system.service.ts y brand.service.ts.
 */

import { prisma } from "@/lib/prisma";
import type {
  AdminCategoryDto,
  CreateAdminCategoryBody,
  UpdateAdminCategoryBody,
} from "@/features/admin/types/admin-category.interface";

/** Genera un slug URL-safe a partir del nombre */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Mapea un registro de Prisma al DTO público */
function toDto(cat: {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  active: boolean;
  size_system_ids: string[];
  parent_category_id: string | null;
}): AdminCategoryDto {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sku: cat.sku,
    description: cat.description,
    active: cat.active,
    sizeSystemIds: cat.size_system_ids,
    parentId: cat.parent_category_id,
  };
}

/** Lista todas las categorías (sin jerarquía anidada, plana) */
export async function listAdminCategories(): Promise<AdminCategoryDto[]> {
  const rows = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      active: true,
      size_system_ids: true,
      parent_category_id: true,
    },
  });
  return rows.map(toDto);
}

/** Crea una categoría nueva */
export async function createAdminCategory(
  body: CreateAdminCategoryBody,
): Promise<AdminCategoryDto> {
  const slug = body.slug?.trim() || toSlug(body.name);
  const row = await prisma.categories.create({
    data: {
      name: body.name.trim(),
      slug,
      sku: body.sku?.trim() ?? null,
      description: body.description?.trim() ?? null,
      active: body.active ?? true,
      size_system_ids: body.sizeSystemIds ?? [],
      parent_category_id: body.parentId ?? null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      active: true,
      size_system_ids: true,
      parent_category_id: true,
    },
  });
  return toDto(row);
}

/** Actualiza una categoría existente (patch parcial) */
export async function updateAdminCategory(
  id: string,
  body: UpdateAdminCategoryBody,
): Promise<AdminCategoryDto> {
  const data: Parameters<typeof prisma.categories.update>[0]["data"] = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.slug !== undefined) data.slug = body.slug.trim();
  if (body.sku !== undefined) data.sku = body.sku.trim() || null;
  if (body.description !== undefined) data.description = body.description.trim() || null;
  if (body.active !== undefined) data.active = body.active;
  if (body.sizeSystemIds !== undefined) data.size_system_ids = body.sizeSystemIds;
  if (body.parentId !== undefined) data.parent_category_id = body.parentId || null;

  const row = await prisma.categories.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      active: true,
      size_system_ids: true,
      parent_category_id: true,
    },
  });
  return toDto(row);
}

/** Elimina una categoría (falla si tiene productos asociados) */
export async function deleteAdminCategory(id: string): Promise<void> {
  await prisma.categories.delete({ where: { id } });
}
