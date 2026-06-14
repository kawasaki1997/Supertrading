import { Wallet, Check, X, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/deposit-config";
import { approveDepositAction, rejectDepositAction } from "@/lib/deposit-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lệnh nạp tiền — Quản trị" };

export default async function AdminDepositsPage() {
  const orders = await prisma.depositOrder.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  const pending = orders.filter((o) => o.status === "PENDING");
  const done = orders.filter((o) => o.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <Wallet className="h-6 w-6 text-gold-400" /> Lệnh nạp tiền
        </h1>
        <p className="mt-1 text-sm text-muted">
          {pending.length} lệnh chờ duyệt · {orders.length} tổng cộng
        </p>
      </div>

      {/* Pending */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <Clock className="h-5 w-5 text-gold-400" /> Chờ duyệt
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted">Không có lệnh nào chờ duyệt.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <div key={o.id} className="flex flex-col gap-3 rounded-2xl glass p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-parchment">
                    <span className="font-mono text-xs text-gold-300">{o.code}</span>
                    {o.user.name}
                    <span className="text-xs font-normal text-muted">({o.user.email})</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Gửi <b className="text-parchment">{o.symbol === "USDT" ? o.cryptoAmount.toFixed(2) : o.cryptoAmount.toFixed(6)} {o.symbol}</b> ({o.network})
                    {" · "}cộng <b className="text-gold-300">${o.amountUsd.toFixed(2)}</b>
                    {" · "}{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(o.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveDepositAction}>
                    <input type="hidden" name="id" value={o.id} />
                    <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-b from-emerald-soft to-emerald-soft/70 px-3.5 py-2 text-xs font-bold text-ink-950 transition-opacity hover:opacity-90">
                      <Check className="h-4 w-4" /> Duyệt (cộng tiền)
                    </button>
                  </form>
                  <form action={rejectDepositAction}>
                    <input type="hidden" name="id" value={o.id} />
                    <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-soft/25 bg-rose-soft/10 px-3.5 py-2 text-xs font-bold text-rose-soft transition-colors hover:bg-rose-soft/20">
                      <X className="h-4 w-4" /> Từ chối
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-parchment">Đã xử lý</h2>
        {done.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted">Chưa có.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl glass">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gold-500/8">
                {done.map((o) => {
                  const s = statusLabel(o.status);
                  return (
                    <tr key={o.id} className="text-parchment-dim">
                      <td className="px-4 py-3 font-mono text-xs text-parchment">{o.code}</td>
                      <td className="px-4 py-3">{o.user.name}</td>
                      <td className="px-4 py-3 font-semibold text-gold-300">${o.amountUsd.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {o.confirmedAt
                          ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(o.confirmedAt)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
