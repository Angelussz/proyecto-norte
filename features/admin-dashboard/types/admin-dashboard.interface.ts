export interface AdminDashboardStats {
  orders: {
    total: number;
    pendingPayment: number;
    paid: number;
    preparing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  payments: {
    approvedCount: number;
    approvedAmount: string | number;
    pendingCount: number;
    rejectedCount: number;
  };
  refunds: {
    successfulCount: number;
    successfulAmount: string | number;
    requiresReviewCount: number;
    inProgressCount: number;
  };
  recentOrders: {
    id: string;
    total: string | number;
    status: "PENDING_PAYMENT" | "PAID" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    created_at: string;
    user: {
      name: string;
      last_name: string;
    };
  }[];
}
