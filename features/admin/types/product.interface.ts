export interface ProductVariantDto {
  id: string;
  sku: string;
  size: string;
  color: string; // nombre del color
  colorHex: string;
  price: number;
  unitCost: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  material: string;
  basePrice: number;
  active: boolean;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  variants: ProductVariantDto[];
}

export interface CreateProductBody {
  name: string;
  categoryId: string;
  material: string;
  basePrice: number;
  description?: string;
  slug?: string;
  active?: boolean;
  // variants se manejan por separado
}

export interface CreateVariantBody {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  unitCost: number;
  stock: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  active: boolean;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  variantCount: number;
  totalStock: number;
}
