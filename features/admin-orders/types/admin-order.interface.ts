import type {
  OrderStatus,
  PaymentMethod,
  PaymentGateway,
  PaymentStatus,
  ReceiptType,
  IdentityDocumentType,
  FiscalStatus,
} from "@/generated/prisma/enums";

export type {
  OrderStatus,
  PaymentMethod,
  PaymentGateway,
  PaymentStatus,
  ReceiptType,
  IdentityDocumentType,
  FiscalStatus,
};

// ─── Máquina de Estados de Órdenes ────────────────────────────────────────────

/**
 * Matriz estricta de transiciones de estado permitidas en el sistema NORTE.
 * Los estados DELIVERED y CANCELLED son terminales (sin transiciones salientes).
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "PREPARING", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

/**
 * Verifica si una transición entre dos estados es permitida por la máquina de estados.
 */
export function isValidOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return false;
  const allowed = VALID_ORDER_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}

/**
 * Determina si el estado actual es terminal (no puede cambiar de estado nunca más).
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "DELIVERED" || status === "CANCELLED";
}

/**
 * Determina si una transición constituye un retroceso operativo (ej. fallo logístico de SHIPPED a PREPARING).
 */
export function isRollbackTransition(current: OrderStatus, next: OrderStatus): boolean {
  return current === "SHIPPED" && next === "PREPARING";
}

/**
 * Determina si la transición exige obligatoriamente un motivo/justificación.
 */
export function isReasonRequired(current: OrderStatus, next: OrderStatus): boolean {
  return next === "CANCELLED" || isRollbackTransition(current, next);
}

/**
 * Determina si un estado es cancelable por el administrador.
 */
export function isCancellable(status: OrderStatus): boolean {
  return !isTerminalStatus(status);
}

/**
 * Determina si por defecto cancelar una orden en este estado debe restituir inventario en ProductVariants.
 * En PENDING_PAYMENT nunca se descontó stock (se descuenta al pagar).
 * En PAID y PREPARING el stock ya fue descontado, por lo que debe devolverse.
 */
export function shouldDefaultRestoreStock(status: OrderStatus): boolean {
  return status === "PAID" || status === "PREPARING";
}

// ─── Modelos y Contratos de Datos ─────────────────────────────────────────────

export interface AdminOrderCustomer {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface AdminOrderAddress {
  id: string;
  recipient: string;
  contact_phone: string;
  address_line: string;
  city: string;
  reference: string | null;
}

export interface AdminOrderItemVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  image_url: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  } | null;
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  sku_snapshot: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  variant?: AdminOrderItemVariant | null;
}

export interface AdminOrderPayment {
  id: string;
  amount: number;
  payment_method: PaymentMethod;
  gateway: PaymentGateway;
  gateway_transaction_id: string | null;
  voucher_url: string | null;
  status: PaymentStatus;
  rejection_reason: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface AdminOrderFiscalVoucher {
  id: string;
  voucher_type: ReceiptType;
  identity_document_type: IdentityDocumentType;
  identity_document_number: string;
  business_name: string;
  fiscal_address: string;
  serial_number: string;
  fiscal_status: FiscalStatus;
  authorization_code: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  issued_at: string;
}

/**
 * Resumen de orden para la bandeja / listado de pedidos del administrador.
 */
export interface AdminOrderSummary {
  id: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  cancel_reason: string | null;
  status_notes: string | null;
  created_at: string;
  updated_at: string;
  user: AdminOrderCustomer;
  items_count: number;
  payment?: {
    payment_method: PaymentMethod;
    gateway: PaymentGateway;
    status: PaymentStatus;
  } | null;
}

/**
 * Detalle completo de orden relacional para la pantalla operativa del pedido.
 */
export interface AdminOrderDetail {
  id: string;
  user_id: string;
  address_id: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  cancel_reason: string | null;
  status_notes: string | null;
  created_at: string;
  updated_at: string;
  user: AdminOrderCustomer;
  address: AdminOrderAddress;
  items: AdminOrderItem[];
  payment: AdminOrderPayment | null;
  fiscal_receipt: AdminOrderFiscalVoucher | null;
}

// ─── DTOs de Entrada / Salida ─────────────────────────────────────────────────

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  expectedUpdatedAt: string;
  reason?: string;
}

export interface CancelOrderDto {
  reason: string;
  expectedUpdatedAt: string;
  restoreStock?: boolean;
}

export interface AdminOrderFilters {
  status?: OrderStatus | "ALL";
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOrderListResponse {
  data: AdminOrderSummary[];
  pagination: AdminOrderPagination;
}
