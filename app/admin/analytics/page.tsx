import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thống kê — Admin" };

export default async function AdminAnalyticsPage() {
  const [deposits, orders, users] = await Promise.all([
    // Lịch sử nạp tiền
    prisma.depositOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    // Lịch sử mua hàng
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    // Tổng số user
    prisma.user.count(),
  ]);

  const depositData = deposits.map((d) => ({
    id: d.id,
    code: d.code,
    userName: d.user.name,
    userEmail: d.user.email,
    method: d.method,
    symbol: d.symbol,
    amountUsd: d.amountUsd,
    cryptoAmount: d.cryptoAmount,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    confirmedAt: d.confirmedAt?.toISOString() || null,
  }));

  const orderData = orders.map((o) => ({
    id: o.id,
    code: o.code,
    userName: o.user.name,
    userEmail: o.user.email,
    productName: o.productName,
    qty: o.qty,
    total: o.total,
    status: o.status,
    deliveryType: o.deliveryType,
    createdAt: o.createdAt.toISOString(),
  }));

  // Thống kê tổng quan
  const stats = {
    totalDeposits: deposits.length,
    totalDepositAmount: deposits
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.amountUsd, 0),
    pendingDeposits: deposits.filter((d) => d.status === "PENDING").length,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0),
    totalUsers: users,
  };

  return (
    <AnalyticsDashboard
      deposits={depositData}
      orders={orderData}
      stats={stats}
    />
  );
}
