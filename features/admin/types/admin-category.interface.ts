/**
 * DTOs para la vista admin de Categorías.
 * Solo se usan en las rutas /api/admin/categories y en los hooks/vistas admin.
 * El tipo público de la tienda vive en features/category/types/category.interface.ts.
 */

export interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  active: boolean;
  /** IDs de los SizeSystem (dentro de SizeGroup) habilitados para esta categoría */
  sizeSystemIds: string[];
  parentId: string | null;
  /** Cantidad de productos activos asignados a esta categoría */
  productCount: number;
}

export interface CreateAdminCategoryBody {
  name: string;
  /** Si se omite, se genera automáticamente desde name */
  slug?: string;
  sku?: string;
  description?: string;
  active?: boolean;
  sizeSystemIds?: string[];
  parentId?: string;
}

export type UpdateAdminCategoryBody = Partial<CreateAdminCategoryBody>;
