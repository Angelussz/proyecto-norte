import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    totalOrders,
    pendingPaymentOrders,
    paidOrders,
    preparingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    approvedPayments,
    pendingPayments,
    rejectedPayments,
    successfulRefunds,
    refundsPendingReview,
    refundsInProgress,
    recentOrders,
  ] = await Promise.all([
    prisma.orders.count(),
    prisma.orders.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.orders.count({ where: { status: "PAID" } }),
    prisma.orders.count({ where: { status: "PREPARING" } }),
    prisma.orders.count({ where: { status: "SHIPPED" } }),
    prisma.orders.count({ where: { status: "DELIVERED" } }),
    prisma.orders.count({ where: { status: "CANCELLED" } }),

    prisma.payments.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payments.count({ where: { status: "PENDING" } }),
    prisma.payments.count({ where: { status: "REJECTED" } }),

    prisma.paymentRefunds.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.paymentRefunds.count({
      where: { status: "REQUIRES_REVIEW" },
    }),
    prisma.paymentRefunds.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),

    prisma.orders.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        total: true,
        status: true,
        created_at: true,
        user: {
          select: {
            name: true,
            last_name: true,
          },
        },
      },
    }),
  ]);

  return {
    orders: {
      total: totalOrders,
      pendingPayment: pendingPaymentOrders,
      paid: paidOrders,
      preparing: preparingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    payments: {
      approvedCount: approvedPayments._count._all,
      approvedAmount: approvedPayments._sum.amount ?? 0,
      pendingCount: pendingPayments,
      rejectedCount: rejectedPayments,
    },
    refunds: {
      successfulCount: successfulRefunds._count._all,
      successfulAmount: successfulRefunds._sum.amount ?? 0,
      requiresReviewCount: refundsPendingReview,
      inProgressCount: refundsInProgress,
    },
    recentOrders,
  };
}
