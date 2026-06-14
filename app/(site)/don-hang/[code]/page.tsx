import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DeliveredBox } from "@/components/order/DeliveredBox";
import { submitReportAction } from "@/lib/report-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chi tiết đơn hàng — Super Trading" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ reported?: string; error?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const { code } = await params;
  const { reported, error } = await searchParams;

  const order = await prisma.order.findFirst({ where: { code, userId: me.id } });
  if (!order) notFound();

  const reports = await prisma.report.findMany({
    where: { userId: me.id, orderCode: code },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/don-hang" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-parchment">
        <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
      </Link>

      {/* Order summary */}
      <div className="rounded-2xl glass p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Mã đơn</p>
            <p className="font-display text-xl font-bold text-parchment">{order.code}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft/10 px-3 py-1 text-xs font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã thanh toán
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info label="Sản phẩm" value={order.productName} />
          <Info label="Số lượng" value={String(order.qty)} />
          <Info label="Thành tiền" value={`$${order.total.toFixed(2)}`} gold />
          <Info label="Thời gian" value={new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(order.createdAt)} />
        </div>
      </div>

      {/* Delivered data */}
      <div className="rounded-2xl glass p-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <PackageCheck className="h-5 w-5 text-gold-400" /> Dữ liệu tài khoản / vật phẩm
        </h2>
        {order.deliveredContent ? (
          <DeliveredBox content={order.deliveredContent} code={order.code} />
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-gold-500/8 p-4 text-sm ring-1 ring-gold-500/20">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
            <p className="text-parchment-dim">
              Đơn của bạn đang chờ được giao dữ liệu. Vui lòng đợi trong giây lát,
              hoặc bấm <b className="text-gold-300">Báo lỗi</b> bên dưới nếu chờ quá lâu.
            </p>
          </div>
        )}
      </div>

      {/* Report */}
      <div className="rounded-2xl glass p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <ShieldAlert className="h-5 w-5 text-rose-soft" /> Báo lỗi / Khiếu nại
        </h2>
        <p className="mb-3 text-xs text-muted">
          Dữ liệu sai, không đăng nhập được, hoặc chưa nhận hàng? Gửi báo lỗi tới admin.
        </p>

        {reported && (
          <p className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-soft/10 px-3 py-2 text-xs font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
            <CheckCircle2 className="h-4 w-4" /> Đã gửi báo lỗi. Admin sẽ xử lý sớm nhất.
          </p>
        )}
        {error === "empty" && (
          <p className="mb-3 rounded-lg bg-rose-soft/10 px-3 py-2 text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
            Vui lòng nhập nội dung báo lỗi.
          </p>
        )}

        {/* Existing reports */}
        {reports.length > 0 && (
          <div className="mb-4 space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-gold-500/12 bg-ink-800/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(r.createdAt)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                    r.status === "RESOLVED"
                      ? "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25"
                      : "bg-gold-500/10 text-gold-300 ring-gold-500/25"
                  }`}>
                    {r.status === "RESOLVED" ? "Đã xử lý" : "Đang chờ"}
                  </span>
                </div>
                <p className="mt-1 text-parchment-dim">{r.message}</p>
                {r.adminReply && (
                  <p className="mt-2 rounded-lg bg-royal-500/10 p-2 text-xs text-royal-300">
                    <b>Admin:</b> {r.adminReply}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <form action={submitReportAction} className="space-y-3">
          <input type="hidden" name="orderCode" value={order.code} />
          <textarea
            name="message"
            required
            rows={3}
            placeholder="Mô tả vấn đề bạn gặp phải…"
            className="w-full rounded-xl border border-gold-500/15 bg-ink-800/70 p-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
          />
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-soft/30 bg-rose-soft/10 px-4 py-2.5 text-sm font-bold text-rose-soft transition-colors hover:bg-rose-soft/20">
            <AlertTriangle className="h-4 w-4" /> Gửi báo lỗi
          </button>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-0.5 font-semibold ${gold ? "text-gold-300" : "text-parchment"}`}>{value}</p>
    </div>
  );
}
