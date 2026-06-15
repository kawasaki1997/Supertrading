import { redirect } from "next/navigation";
import { History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transactions — Super Trading" };

type Tx = {
  id: string;
  kind: "deposit" | "purchase";
  desc: string;
  amount: number; // + for deposit, - for purchase
  at: Date;
};

export default async function TransactionsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const [deposits, orders] = await Promise.all([
    prisma.depositOrder.findMany({
      where: { userId: me.id, status: "COMPLETED" },
      orderBy: { confirmedAt: "desc" },
      take: 100,
    }),
    prisma.order.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const t = await getT();

  const txs: Tx[] = [
    ...deposits.map((d) => ({
      id: d.id,
      kind: "deposit" as const,
      desc: `${t("tx.deposit")} ${d.symbol} (${d.network})`,
      amount: d.amountUsd,
      at: d.confirmedAt ?? d.createdAt,
    })),
    ...orders.map((o) => ({
      id: o.id,
      kind: "purchase" as const,
      desc: o.productName + (o.qty > 1 ? ` ×${o.qty}` : ""),
      amount: -o.total,
      at: o.createdAt,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <History className="h-6 w-6 text-gold-400" /> {t("tx.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("tx.sub")}</p>
      </div>

      {txs.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">{t("tx.empty")}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <ul className="divide-y divide-gold-500/8">
            {txs.map((tx) => {
              const positive = tx.amount >= 0;
              return (
                <li key={tx.kind + tx.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${positive ? "bg-emerald-soft/10 ring-emerald-soft/25" : "bg-rose-soft/10 ring-rose-soft/25"}`}>
                    {positive ? <ArrowDownCircle className="h-5 w-5 text-emerald-soft" /> : <ArrowUpCircle className="h-5 w-5 text-rose-soft" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-parchment">{tx.desc}</p>
                    <p className="text-xs text-muted">
                      {positive ? t("tx.deposit") : t("tx.purchase")} ·{" "}
                      {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(tx.at)}
                    </p>
                  </div>
                  <span className={`shrink-0 font-display text-sm font-bold ${positive ? "text-emerald-soft" : "text-rose-soft"}`}>
                    {positive ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
