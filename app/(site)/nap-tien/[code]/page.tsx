import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { statusLabel } from "@/lib/deposit-config";
import { CopyField } from "@/components/deposit/CopyField";
import { DepositWatcher } from "@/components/deposit/DepositWatcher";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deposit Details — Super Trading" };

const statusKey: Record<string, string> = {
  PENDING: "deposit.statusPending",
  COMPLETED: "deposit.statusCompleted",
  REJECTED: "deposit.statusRejected",
};

export default async function DepositOrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const { code } = await params;
  const order = await prisma.depositOrder.findUnique({ where: { code } });
  if (!order) notFound();
  if (order.userId !== me.id) redirect("/nap-tien");

  const t = await getT();
  const cls = statusLabel(order.status).cls;
  const sendStr =
    order.symbol === "USDT" ? order.cryptoAmount.toFixed(4) : order.cryptoAmount.toFixed(6);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/nap-tien" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-parchment">
        <ArrowLeft className="h-4 w-4" /> {t("deposit.backToDeposit")}
      </Link>

      <div className="space-y-5 rounded-2xl glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">{t("deposit.orderCode")}</p>
            <p className="font-display text-xl font-bold text-parchment">{order.code}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}>
            {order.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : order.status === "REJECTED" ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {t(statusKey[order.status] ?? "deposit.statusPending")}
          </span>
        </div>

        {order.status === "PENDING" && (
          <>
            <div className="rounded-xl border border-gold-500/15 bg-ink-800/40 p-4 text-center">
              <p className="text-xs text-muted">{t("deposit.transferExact")}</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold-grad">
                {sendStr} {order.symbol}
              </p>
              <p className="mt-1 text-xs text-muted">{t("deposit.viaNetwork")} {order.network} · {t("deposit.credited")} ${order.amountUsd.toFixed(2)}</p>
            </div>

            <CopyField label={`${t("deposit.walletAddr")} (${order.network})`} value={order.address} />

            <div className="rounded-xl bg-gold-500/8 p-3 text-xs ring-1 ring-gold-500/20">
              <p className="text-parchment-dim">⏳ {t("deposit.waitNote")} ({order.network})</p>
            </div>

            <DepositWatcher code={order.code} />
          </>
        )}

        {order.status === "COMPLETED" && (
          <div className="rounded-xl bg-emerald-soft/10 p-4 text-center text-sm text-emerald-soft ring-1 ring-emerald-soft/25">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8" />
            <b>${order.amountUsd.toFixed(2)}</b> {t("deposit.creditedDone")}
          </div>
        )}

        {order.status === "REJECTED" && (
          <div className="rounded-xl bg-rose-soft/10 p-4 text-center text-sm text-rose-soft ring-1 ring-rose-soft/25">
            <XCircle className="mx-auto mb-2 h-8 w-8" />
            {t("deposit.rejectedMsg")}
          </div>
        )}
      </div>
    </div>
  );
}
