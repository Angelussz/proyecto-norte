import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type SettingsAdminErrorCode = "VALIDATION";

export class SettingsAdminError extends Error {
  constructor(
    public readonly code: SettingsAdminErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SettingsAdminError";
  }
}

export const SETTINGS_ADMIN_STATUS: Record<SettingsAdminErrorCode, number> = {
  VALIDATION: 400,
};

const settingsSchema = z
  .object({
    shippingCost: z.number().finite().min(0).max(1000000).optional(),
    shippingLabel: z.string().trim().min(1).max(80).optional(),
    freeShippingThreshold: z.number().finite().min(0).max(1000000).nullable().optional(),
    taxRate: z.number().finite().min(0).max(1).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debés enviar al menos un campo para actualizar.",
  });

function serializeSettings(settings: {
  id: string;
  shipping_cost: { toNumber(): number };
  shipping_label: string;
  free_shipping_threshold: { toNumber(): number } | null;
  tax_rate: { toNumber(): number };
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: settings.id,
    shippingCost: settings.shipping_cost.toNumber(),
    shippingLabel: settings.shipping_label,
    freeShippingThreshold: settings.free_shipping_threshold?.toNumber() ?? null,
    taxRate: settings.tax_rate.toNumber(),
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
  };
}

async function getOrCreateSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export async function getAdminSettings() {
  const settings = await getOrCreateSettings();
  return { data: serializeSettings(settings) };
}

export async function updateAdminSettings(body: unknown) {
  const result = settingsSchema.safeParse(body);

  if (!result.success) {
    throw new SettingsAdminError(
      "VALIDATION",
      result.error.issues[0]?.message ?? "Configuración inválida.",
    );
  }

  const data = result.data;

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...(data.shippingCost !== undefined && {
        shipping_cost: data.shippingCost,
      }),
      ...(data.shippingLabel !== undefined && {
        shipping_label: data.shippingLabel,
      }),
      ...(data.freeShippingThreshold !== undefined && {
        free_shipping_threshold: data.freeShippingThreshold,
      }),
      ...(data.taxRate !== undefined && {
        tax_rate: data.taxRate,
      }),
    },
    update: {
      ...(data.shippingCost !== undefined && {
        shipping_cost: data.shippingCost,
      }),
      ...(data.shippingLabel !== undefined && {
        shipping_label: data.shippingLabel,
      }),
      ...(data.freeShippingThreshold !== undefined && {
        free_shipping_threshold: data.freeShippingThreshold,
      }),
      ...(data.taxRate !== undefined && {
        tax_rate: data.taxRate,
      }),
    },
  });

  return { data: serializeSettings(settings) };
}
