import { prisma } from "@/lib/db";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quản lý tài khoản — Admin" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          deposits: true,
          orders: true,
        },
      },
    },
  });

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    balance: u.balance,
    role: u.role,
    totalDeposits: u._count.deposits,
    totalOrders: u._count.orders,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersManager users={data} />;
}
