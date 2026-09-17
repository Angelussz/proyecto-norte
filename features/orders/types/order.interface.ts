import type { OrderStatus } from "@/generated/prisma/client";

export type OrderItem = {
  id: string;
  order_id: string;
  variant_id: string;
  sku_snapshot: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  user_id: string;
  address_id: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type OrderListParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export type OrderListResponse = {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateOrderStatusParams = {
  status: OrderStatus;
  expectedUpdatedAt: string;
};

export type UpdateOrderStatusResult =
  | { success: true; order: Order }
  | { success: false; error: string };
