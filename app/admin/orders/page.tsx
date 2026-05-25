import { getAllOrders } from "@/lib/data";
import OrdersClient from "@/components/admin/orders-client";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = getAllOrders().reverse();
  return <OrdersClient initialOrders={orders} />;
}
