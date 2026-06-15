import { redirect } from "next/navigation";
import { MessageSquare, CheckCircle2, Info } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/lib/i18n";
import { submitSupportAction } from "@/lib/report-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hỗ trợ — Super Trading" };

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const { sent, error } = await searchParams;
  const t = await getT();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <MessageSquare className="h-6 w-6 text-gold-400" /> {t("support.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("support.sub")}</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-gold-500/8 px-4 py-3 text-xs text-gold-300 ring-1 ring-gold-500/20">
        <Info className="mt-0.5 h-4 w-4 shrink-0" /> {t("support.orderIssue")}
      </p>

      <div className="rounded-2xl glass p-6">
        {sent && (
          <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-soft/10 px-3 py-2 text-sm font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
            <CheckCircle2 className="h-4 w-4" /> {t("support.sent")}
          </p>
        )}
        {error === "empty" && (
          <p className="mb-4 rounded-lg bg-rose-soft/10 px-3 py-2 text-sm font-medium text-rose-soft ring-1 ring-rose-soft/25">
            {t("order.reportEmpty")}
          </p>
        )}

        <form action={submitSupportAction} className="space-y-3">
          <label className="block text-sm font-semibold text-parchment-dim">{t("support.message")}</label>
          <textarea
            name="message"
            required
            rows={4}
            placeholder={t("support.placeholder")}
            className="w-full rounded-xl border border-gold-500/15 bg-ink-800/70 p-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
          />
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500">
            <MessageSquare className="h-4 w-4" /> {t("support.send")}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted">{t("support.contact")}</p>
      </div>
    </div>
  );
}
