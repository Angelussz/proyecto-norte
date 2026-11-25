// ── DTOs de respuesta ─────────────────────────────────────────────────────────

export interface BrandDto {
  id: string;
  name: string;
  skuPrefix: string;
  description: string | null;
  iconColor: string;
  locked: boolean;
  active: boolean;
  sortOrder: number;
  assignedItems: number; // siempre 0 por ahora (campo calculado futuro)
}

export interface ColorDto {
  id: string;
  name: string;
  skuCode: string;
  hex: string;
  active: boolean;
  sortOrder: number;
  assignedItems: number; // siempre 0 por ahora (campo calculado futuro)
}

// ── Bodies de creación / edición ──────────────────────────────────────────────

export interface CreateBrandBody {
  name: string;
  skuPrefix: string;
  description?: string;
  iconColor?: string;
  active?: boolean;
}

export type UpdateBrandBody = Partial<CreateBrandBody>;

export interface CreateColorBody {
  name: string;
  skuCode: string;
  hex: string;
  active?: boolean;
}

export type UpdateColorBody = Partial<CreateColorBody>;
