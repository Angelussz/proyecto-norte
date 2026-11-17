export interface AdminSettings {
  id: string;
  shippingCost: number;
  shippingLabel: string;
  freeShippingThreshold: number | null;
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettingsResponse {
  data: AdminSettings;
}

export interface UpdateAdminSettingsDto {
  shippingCost?: number;
  shippingLabel?: string;
  freeShippingThreshold?: number | null;
  taxRate?: number;
}
