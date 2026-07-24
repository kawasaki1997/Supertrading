import { prisma } from "@/lib/db";
import { DepositApproval } from "@/components/admin/DepositApproval";

export const dynamic = "force-dynamic";
export const metadata = { title: "Duyệt nạp tiền — Admin" };

export default async function AdminDepositsPage() {
  const pending = await prisma.depositOrder.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deposits = pending.map((d) => ({
    id: d.id,
    code: d.code,
    username: d.user.name,
    email: d.user.email,
    method: d.method,
    symbol: d.symbol,
    network: d.network,
    cryptoAmount: d.cryptoAmount,
    amountUsd: d.amountUsd,
    amountVnd: Math.round(d.amountUsd / 0.00004),
    createdAt: d.createdAt.toISOString(),
    userId: d.user.id,
  }));

  return <DepositApproval deposits={deposits} />;
}
