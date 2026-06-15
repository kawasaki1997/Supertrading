import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, BellOff, Wallet, PackageCheck, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getNotifications, markAllRead } from "@/lib/notify";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications — Super Trading" };

const ICONS = { DEPOSIT: Wallet, ORDER: PackageCheck, REPORT: ShieldCheck } as const;

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const [items, t] = await Promise.all([getNotifications(me.id), getT()]);
  await markAllRead(me.id);

  function content(n: (typeof items)[number]) {
    if (n.type === "DEPOSIT")
      return {
        title: t("notif.depositTitle"),
        msg: `+$${(n.amount ?? 0).toFixed(2)} ${t("notif.depositMsg")}`,
      };
    if (n.type === "ORDER")
      return { title: t("notif.orderTitle"), msg: t("notif.orderMsg") };
    return { title: t("notif.reportTitle"), msg: t("notif.reportMsg") };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
        <Bell className="h-6 w-6 text-gold-400" /> {t("notif.title")}
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl glass p-12 text-center">
          <BellOff className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="text-sm text-muted">{t("notif.empty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <ul className="divide-y divide-gold-500/8">
            {items.map((n) => {
              const Icon = ICONS[n.type as keyof typeof ICONS] ?? Bell;
              const c = content(n);
              const inner = (
                <div className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${!n.read ? "bg-gold-500/5" : ""} ${n.href ? "hover:bg-ink-800/40" : ""}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-800/70 ring-1 ring-gold-500/15">
                    <Icon className="h-5 w-5 text-gold-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-parchment">
                      {c.title}
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
                    </p>
                    <p className="text-sm text-parchment-dim">{c.msg}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.href ? <Link href={n.href}>{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
