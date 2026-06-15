import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Khiếu nại — Super Trading" };

export default async function ComplaintsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const reports = await prisma.report.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <AlertTriangle className="h-6 w-6 text-gold-400" /> {t("complaints.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("complaints.sub")}</p>
      </div>

      <p className="rounded-xl bg-gold-500/8 px-4 py-3 text-xs text-gold-300 ring-1 ring-gold-500/20">
        {t("complaints.note")}
      </p>

      {reports.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">{t("complaints.empty")}</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl glass p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">
                  {r.orderCode && (
                    <Link href={`/don-hang/${r.orderCode}`} className="mr-2 font-mono text-gold-300 hover:underline">
                      {t("complaints.order")} {r.orderCode}
                    </Link>
                  )}
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(r.createdAt)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                  r.status === "RESOLVED"
                    ? "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25"
                    : "bg-gold-500/10 text-gold-300 ring-gold-500/25"
                }`}>
                  {r.status === "RESOLVED" ? t("complaints.resolved") : t("complaints.pending")}
                </span>
              </div>
              <p className="mt-2 text-sm text-parchment-dim">{r.message}</p>
              {r.adminReply && (
                <p className="mt-2 rounded-lg bg-royal-500/10 p-2.5 text-xs text-royal-300">
                  <b>{t("complaints.adminReply")}:</b> {r.adminReply}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
