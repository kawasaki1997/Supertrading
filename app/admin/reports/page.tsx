import { ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { resolveReportAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Báo lỗi / Khiếu nại — Quản trị" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  const open = reports.filter((r) => r.status === "OPEN");
  const resolved = reports.filter((r) => r.status !== "OPEN");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <ShieldAlert className="h-6 w-6 text-rose-soft" /> Báo lỗi / Khiếu nại
        </h1>
        <p className="mt-1 text-sm text-muted">{open.length} đang chờ xử lý · {reports.length} tổng cộng</p>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <Clock className="h-5 w-5 text-gold-400" /> Đang chờ
        </h2>
        {open.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted">Không có báo lỗi nào chờ xử lý.</p>
        ) : (
          open.map((r) => (
            <div key={r.id} className="space-y-3 rounded-2xl glass p-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-parchment">
                  {r.user.name} <span className="text-xs font-normal text-muted">({r.user.email})</span>
                </span>
                <span className="text-xs text-muted">
                  {r.orderCode && <span className="mr-2 font-mono text-gold-300">{r.orderCode}</span>}
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(r.createdAt)}
                </span>
              </div>
              <p className="rounded-lg bg-ink-800/60 p-3 text-sm text-parchment-dim">{r.message}</p>
              <form action={resolveReportAction} className="flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="id" value={r.id} />
                <input
                  name="reply"
                  placeholder="Phản hồi cho khách (tuỳ chọn)…"
                  className="h-10 flex-1 rounded-lg border border-gold-500/15 bg-ink-800/70 px-3 text-sm text-parchment placeholder:text-muted outline-none focus:border-gold-500/40"
                />
                <button className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-emerald-soft to-emerald-soft/70 px-4 py-2 text-xs font-bold text-ink-950 transition-opacity hover:opacity-90">
                  <CheckCircle2 className="h-4 w-4" /> Đánh dấu đã xử lý
                </button>
              </form>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-parchment">Đã xử lý</h2>
        {resolved.length === 0 ? (
          <p className="rounded-xl glass p-4 text-sm text-muted">Chưa có.</p>
        ) : (
          resolved.map((r) => (
            <div key={r.id} className="rounded-2xl glass p-4 text-sm opacity-80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-parchment">{r.user.name}</span>
                <span className="rounded-full bg-emerald-soft/10 px-2 py-0.5 text-[11px] font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
                  Đã xử lý
                </span>
              </div>
              <p className="mt-1 text-parchment-dim">{r.message}</p>
              {r.adminReply && <p className="mt-2 text-xs text-royal-300"><b>Phản hồi:</b> {r.adminReply}</p>}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
