import { AdminOrderDetailView } from "@/features/admin-orders/components/order-detail-view";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;

  return <AdminOrderDetailView orderId={id} />;
}
