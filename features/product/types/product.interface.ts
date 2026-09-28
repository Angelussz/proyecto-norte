export type ProductVariant = {
  size: string;
  stock: number;
}

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_name: string;
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  images: string[];
};

export type Suggestion = {
  id: string;
  name: string;
  base_price: number;
  image_url: string;
};

export type ProductDetailResponse = {
  product: ProductDetail;
  suggestions: Suggestion[];
};
