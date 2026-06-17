import { redirect } from "next/navigation";
import Link from "next/link";
import { ScrollText, Package, ArrowRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders — Super Trading" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const { ok } = await searchParams;

  const orders = await prisma.order.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const t = await getT();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-gold-400" />
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment">
          {t("orders.title")}
        </h1>
      </div>

      {ok === "checkout" && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-soft/10 px-4 py-3 text-sm font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
          <CheckCircle2 className="h-4 w-4" /> {t("orders.checkoutOk")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl glass px-4 py-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">{t("orders.totalOrders")}</p>
          <p className="font-display text-2xl font-bold text-parchment">{orders.length}</p>
        </div>
        <div className="rounded-2xl glass px-4 py-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">{t("orders.spent")}</p>
          <p className="font-display text-2xl font-bold text-gold-grad">${formatPrice(totalSpent)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="text-sm text-muted">{t("orders.empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
          >
            {t("orders.shopNow")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-500/10 text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">{t("orders.code")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.product")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.amount")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.status")}</th>
                <th className="px-4 py-3 font-semibold">{t("orders.time")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/8">
              {orders.map((o) => (
                <tr key={o.id} className="text-parchment-dim transition-colors hover:bg-ink-800/40">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/don-hang/${o.code}`} className="text-gold-300 hover:text-gold-200 hover:underline">
                      {o.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-parchment">{o.productName}</td>
                  <td className="px-4 py-3 font-semibold text-gold-300">${formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const b =
                        o.status === "CANCELLED"
                          ? { text: t("status.cancelled"), cls: "bg-rose-soft/10 text-rose-soft ring-rose-soft/25" }
                          : o.deliveryType === "MANUAL" && o.status === "PENDING"
                            ? { text: t("status.processing"), cls: "bg-gold-500/10 text-gold-300 ring-gold-500/25" }
                            : o.deliveryType === "MANUAL" && o.status === "DELIVERED"
                              ? { text: t("status.delivered"), cls: "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25" }
                              : { text: t("orders.done"), cls: "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25" };
                      return (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${b.cls}`}>
                          {b.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/don-hang/${o.code}`} className="text-xs font-semibold text-gold-400 hover:text-gold-300">
                      {t("orders.view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
