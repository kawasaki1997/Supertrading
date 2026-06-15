import {
  Hand,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  User as UserIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { markOrderDeliveredAction, cancelOrderAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đơn giao tay — Quản trị" };

const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;

  const orders = await prisma.order.findMany({
    where: { deliveryType: "MANUAL" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  });

  const pending = orders.filter((o) => o.status === "PENDING");

  const okMsg: Record<string, string> = {
    delivered: "Đã đánh dấu giao xong & thông báo cho khách.",
    cancelled: "Đã hủy đơn & hoàn tiền cho khách.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <Hand className="h-6 w-6 text-royal-300" /> Đơn cần giao thủ công
        </h1>
        <p className="mt-1 text-sm text-muted">
          {pending.length} đơn đang chờ giao · {orders.length} đơn giao tay tổng cộng
        </p>
      </div>

      {ok && okMsg[ok] && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-soft/10 px-4 py-3 text-sm font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
          <CheckCircle2 className="h-4 w-4" /> {okMsg[ok]}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">
          Chưa có đơn giao tay nào. Hãy đặt sản phẩm ở chế độ &quot;Giao thủ công&quot; trong mục Sản phẩm.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const badge =
              o.status === "CANCELLED"
                ? { text: "Đã hủy", cls: "bg-rose-soft/10 text-rose-soft ring-rose-soft/25", Icon: XCircle }
                : o.status === "DELIVERED"
                  ? { text: "Đã giao", cls: "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25", Icon: CheckCircle2 }
                  : { text: "Đang chờ giao", cls: "bg-gold-500/10 text-gold-300 ring-gold-500/25", Icon: Clock };
            return (
              <div
                key={o.id}
                className={`rounded-2xl glass p-4 ${o.status === "PENDING" ? "ring-1 ring-gold-500/25" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gold-300">{o.code}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${badge.cls}`}>
                        <badge.Icon className="h-3 w-3" /> {badge.text}
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-base font-semibold text-parchment">
                      {o.productName} <span className="text-sm text-muted">× {o.qty}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <UserIcon className="h-3.5 w-3.5" /> {o.user.email} · {fmt.format(o.createdAt)}
                    </p>
                  </div>
                  <span className="font-display text-lg font-bold text-gold-grad">${o.total.toFixed(2)}</span>
                </div>

                {/* Game info */}
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-ink-800/60 p-3 text-sm ring-1 ring-gold-500/10 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted">Nick game nhận hàng</p>
                    <p className="font-semibold text-parchment">{o.gameUsername || "—"}</p>
                  </div>
                  {o.gameNote && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Ghi chú của khách</p>
                      <p className="text-parchment-dim">{o.gameNote}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {o.status === "PENDING" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={markOrderDeliveredAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-4 py-2 text-xs font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500">
                        <PackageCheck className="h-4 w-4" /> Đánh dấu đã giao
                      </button>
                    </form>
                    <form action={cancelOrderAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-soft/25 bg-rose-soft/10 px-4 py-2 text-xs font-semibold text-rose-soft transition-colors hover:bg-rose-soft/20">
                        <XCircle className="h-4 w-4" /> Hủy &amp; hoàn tiền
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
