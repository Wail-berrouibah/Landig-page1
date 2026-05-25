import { getAllOrders } from "@/lib/data";
import DashboardClient from "@/components/admin/dashboard-client";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const orders = getAllOrders();
  return <DashboardClient initialOrders={orders} />;
}
