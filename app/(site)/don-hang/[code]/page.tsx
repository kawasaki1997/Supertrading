import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Hand, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DeliveredBox } from "@/components/order/DeliveredBox";
import { submitReportAction } from "@/lib/report-actions";
import { getT } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Details — Super Trading" };

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

  const t = await getT();
  const manual = order.deliveryType === "MANUAL";

  const badge =
    order.status === "CANCELLED"
      ? { text: t("status.cancelled"), cls: "bg-rose-soft/10 text-rose-soft ring-rose-soft/25", Icon: XCircle }
      : manual && order.status === "PENDING"
        ? { text: t("status.processing"), cls: "bg-gold-500/10 text-gold-300 ring-gold-500/25", Icon: Clock }
        : manual && order.status === "DELIVERED"
          ? { text: t("status.delivered"), cls: "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25", Icon: CheckCircle2 }
          : { text: t("order.paid"), cls: "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25", Icon: CheckCircle2 };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/don-hang" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-parchment">
        <ArrowLeft className="h-4 w-4" /> {t("order.back")}
      </Link>

      {/* Order summary */}
      <div className="rounded-2xl glass p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">{t("order.code")}</p>
            <p className="font-display text-xl font-bold text-parchment">{order.code}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${badge.cls}`}>
            <badge.Icon className="h-3.5 w-3.5" /> {badge.text}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info label={t("order.product")} value={order.productName} />
          <Info label={t("order.qty")} value={String(order.qty)} />
          <Info label={t("order.total")} value={`$${formatPrice(order.total)}`} gold />
          <Info label={t("order.time")} value={new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(order.createdAt)} />
        </div>
      </div>

      {/* Delivery section */}
      {manual ? (
        <div className="rounded-2xl glass p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-parchment">
            <Hand className="h-5 w-5 text-royal-300" /> {t("order.dataTitle")}
          </h2>
          {order.status === "CANCELLED" ? (
            <div className="flex items-start gap-3 rounded-xl bg-rose-soft/8 p-4 text-sm ring-1 ring-rose-soft/20">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-soft" />
              <p className="text-parchment-dim">{t("order.cancelledRefund")}</p>
            </div>
          ) : order.status === "DELIVERED" ? (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-soft/8 p-4 text-sm ring-1 ring-emerald-soft/20">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-soft" />
              <p className="text-parchment-dim">{t("order.manualDelivered")}</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-gold-500/8 p-4 text-sm ring-1 ring-gold-500/20">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
              <p className="text-parchment-dim">{t("order.manualProcessing")}</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label={t("order.gameUsername")} value={order.gameUsername || "—"} />
            {order.gameNote && <Info label={t("order.gameNote")} value={order.gameNote} />}
          </div>
          {order.status !== "CANCELLED" && (
            <p className="mt-3 text-xs text-muted">{t("order.manualHint")}</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl glass p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-parchment">
            <PackageCheck className="h-5 w-5 text-gold-400" /> {t("order.dataTitle")}
          </h2>
          {order.deliveredContent ? (
            <DeliveredBox content={order.deliveredContent} code={order.code} />
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-gold-500/8 p-4 text-sm ring-1 ring-gold-500/20">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
              <p className="text-parchment-dim">{t("order.waiting")}</p>
            </div>
          )}
        </div>
      )}

      {/* Report */}
      <div className="rounded-2xl glass p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <ShieldAlert className="h-5 w-5 text-rose-soft" /> {t("order.reportTitle")}
        </h2>
        <p className="mb-3 text-xs text-muted">{t("order.reportSub")}</p>

        {reported && (
          <p className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-soft/10 px-3 py-2 text-xs font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
            <CheckCircle2 className="h-4 w-4" /> {t("order.reportSent")}
          </p>
        )}
        {error === "empty" && (
          <p className="mb-3 rounded-lg bg-rose-soft/10 px-3 py-2 text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
            {t("order.reportEmpty")}
          </p>
        )}

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
                    {r.status === "RESOLVED" ? t("order.reportResolved") : t("order.reportPending")}
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
            placeholder={t("order.reportPlaceholder")}
            className="w-full rounded-xl border border-gold-500/15 bg-ink-800/70 p-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
          />
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-soft/30 bg-rose-soft/10 px-4 py-2.5 text-sm font-bold text-rose-soft transition-colors hover:bg-rose-soft/20">
            <AlertTriangle className="h-4 w-4" /> {t("order.reportSend")}
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
