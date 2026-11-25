/**
 * features/admin/services/size-system.service.ts
 *
 * Lógica de negocio pura para Grupos y Sistemas de Talles.
 * Sin imports de Next.js (Request/Response): fácil de testear.
 */

import { prisma } from "@/lib/prisma";
import type {
  SizeGroupDto,
  CreateSizeGroupBody,
  UpdateSizeGroupBody,
} from "@/features/admin/types/size-system.interface";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mapGroup(group: {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  systems: {
    id: string;
    label: string;
    description: string | null;
    badge: string | null;
    badge_variant: string | null;
    sizes: string[];
    active: boolean;
    sort_order: number;
  }[];
}): SizeGroupDto {
  return {
    id: group.id,
    title: group.title,
    description: group.description,
    sort_order: group.sort_order,
    systems: group.systems.map((s) => ({
      id: s.id,
      label: s.label,
      description: s.description,
      badge: s.badge,
      badge_variant: s.badge_variant,
      sizes: s.sizes,
      active: s.active,
      sort_order: s.sort_order,
    })),
  };
}

const GROUP_INCLUDE = {
  systems: { orderBy: { sort_order: "asc" as const } },
};

// ─── Listar todos los grupos con sus sistemas ─────────────────────────────────
export async function getAllSizeGroups(): Promise<SizeGroupDto[]> {
  const groups = await prisma.sizeGroup.findMany({
    include: GROUP_INCLUDE,
    orderBy: { sort_order: "asc" },
  });
  return groups.map(mapGroup);
}

// ─── Obtener un grupo por ID ──────────────────────────────────────────────────
export async function getSizeGroupById(id: string): Promise<SizeGroupDto | null> {
  const group = await prisma.sizeGroup.findUnique({
    where: { id },
    include: GROUP_INCLUDE,
  });
  return group ? mapGroup(group) : null;
}

// ─── Crear un nuevo grupo con sus sistemas ────────────────────────────────────
export async function createSizeGroup(body: CreateSizeGroupBody): Promise<SizeGroupDto> {
  // Averiguar el próximo sort_order
  const count = await prisma.sizeGroup.count();

  const group = await prisma.sizeGroup.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      sort_order: count,
      systems: {
        create: (body.systems ?? []).map((s, i) => ({
          label: s.label.trim(),
          description: s.description?.trim() ?? null,
          badge: s.badge?.trim() ?? null,
          badge_variant: s.badge_variant ?? null,
          sizes: s.sizes,
          active: s.active ?? true,
          sort_order: i,
        })),
      },
    },
    include: GROUP_INCLUDE,
  });

  return mapGroup(group);
}

// ─── Actualizar un grupo (y sus sistemas) ────────────────────────────────────
export async function updateSizeGroup(
  id: string,
  body: UpdateSizeGroupBody,
): Promise<SizeGroupDto | null> {
  const existing = await prisma.sizeGroup.findUnique({ where: { id } });
  if (!existing) return null;

  // 1. Actualizar campos del grupo
  await prisma.sizeGroup.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title.trim() : undefined,
      description: body.description !== undefined ? body.description.trim() : undefined,
    },
  });

  // 2. Si se envían sistemas → sincronizar preservando IDs existentes
  if (body.systems !== undefined) {
    const existingSystems = await prisma.sizeSystem.findMany({ where: { group_id: id } });
    const existingIds = new Set(existingSystems.map((s) => s.id));
    const incomingIds = new Set(
      body.systems.map((s) => s.id).filter((sysId): sysId is string => Boolean(sysId)),
    );

    // Eliminar sistemas que ya no están
    const toDeleteIds = existingSystems.filter((s) => !incomingIds.has(s.id)).map((s) => s.id);
    if (toDeleteIds.length > 0) {
      await prisma.sizeSystem.deleteMany({ where: { id: { in: toDeleteIds } } });
    }

    // Actualizar o crear cada sistema
    for (let i = 0; i < body.systems.length; i++) {
      const s = body.systems[i];
      if (s.id && existingIds.has(s.id)) {
        await prisma.sizeSystem.update({
          where: { id: s.id },
          data: {
            label: s.label.trim(),
            description: s.description?.trim() ?? null,
            badge: s.badge?.trim() ?? null,
            badge_variant: s.badge_variant ?? null,
            sizes: s.sizes,
            active: s.active ?? true,
            sort_order: s.sort_order ?? i,
          },
        });
      } else {
        await prisma.sizeSystem.create({
          data: {
            group_id: id,
            label: s.label.trim(),
            description: s.description?.trim() ?? null,
            badge: s.badge?.trim() ?? null,
            badge_variant: s.badge_variant ?? null,
            sizes: s.sizes,
            active: s.active ?? true,
            sort_order: s.sort_order ?? i,
          },
        });
      }
    }
  }

  const updated = await prisma.sizeGroup.findUnique({
    where: { id },
    include: GROUP_INCLUDE,
  });
  return updated ? mapGroup(updated) : null;
}

// ─── Eliminar un grupo (y sus sistemas en cascada) ───────────────────────────
export async function deleteSizeGroup(id: string): Promise<boolean> {
  const existing = await prisma.sizeGroup.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.sizeGroup.delete({ where: { id } });
  return true;
}

// ─── Activar / desactivar un sistema de talles ───────────────────────────────
export async function toggleSizeSystem(
  systemId: string,
  active: boolean,
): Promise<{ id: string; active: boolean } | null> {
  const existing = await prisma.sizeSystem.findUnique({ where: { id: systemId } });
  if (!existing) return null;
  const updated = await prisma.sizeSystem.update({
    where: { id: systemId },
    data: { active },
    select: { id: true, active: true },
  });
  return updated;
}

// ─── Eliminar un sistema de talles individual ───────────────────────────────
export async function deleteSizeSystem(systemId: string): Promise<boolean> {
  const existing = await prisma.sizeSystem.findUnique({ where: { id: systemId } });
  if (!existing) return false;
  await prisma.sizeSystem.delete({ where: { id: systemId } });
  return true;
}
