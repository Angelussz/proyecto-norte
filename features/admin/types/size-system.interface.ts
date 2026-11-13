/**
 * Contratos de tipos del dominio de Sistemas de Talles.
 */

// ─── Respuesta pública de un sistema de talles ──────────────────────────────
export interface SizeSystemDto {
  id: string;
  label: string;
  description: string | null;
  badge: string | null;
  badge_variant: string | null;
  sizes: string[];
  active: boolean;
  sort_order: number;
}

// ─── Respuesta pública de un grupo de talles ─────────────────────────────────
export interface SizeGroupDto {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  systems: SizeSystemDto[];
}

// ─── Body para crear un grupo con sus sistemas ───────────────────────────────
export interface CreateSizeGroupBody {
  title: string;
  description?: string;
  systems: {
    label: string;
    description?: string;
    badge?: string;
    badge_variant?: string;
    sizes: string[];
    active?: boolean;
  }[];
}

// ─── Body para actualizar un grupo ───────────────────────────────────────────
export interface UpdateSizeGroupBody {
  title?: string;
  description?: string;
  systems?: {
    id?: string; // si tiene id → update; si no → create
    label: string;
    description?: string;
    badge?: string;
    badge_variant?: string;
    sizes: string[];
    active?: boolean;
    sort_order?: number;
  }[];
}

// ─── Body para activar/desactivar un sistema individual ──────────────────────
export interface ToggleSizeSystemBody {
  active: boolean;
}
