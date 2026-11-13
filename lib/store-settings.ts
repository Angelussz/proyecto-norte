import { prisma } from "@/lib/prisma";

export type StoreSettingsValues = {
  shippingCost: number;
  shippingLabel: string;
  freeShippingThreshold: number | null;
  taxRate: number;
};

export async function getStoreSettings(): Promise<StoreSettingsValues> {
  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  return {
    shippingCost: settings.shipping_cost.toNumber(),
    shippingLabel: settings.shipping_label,
    freeShippingThreshold: settings.free_shipping_threshold?.toNumber() ?? null,
    taxRate: settings.tax_rate.toNumber(),
  };
}
