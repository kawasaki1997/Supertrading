import { BookOpen, HelpCircle } from "lucide-react";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hướng dẫn — Super Trading" };

export default async function GuidePage() {
  const t = await getT();
  const faqs = [
    { q: t("guide.q1"), a: t("guide.a1") },
    { q: t("guide.q2"), a: t("guide.a2") },
    { q: t("guide.q3"), a: t("guide.a3") },
    { q: t("guide.q4"), a: t("guide.a4") },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
          <BookOpen className="h-6 w-6 text-gold-400" /> {t("guide.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("guide.sub")}</p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-2xl glass p-5">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-parchment">
              <HelpCircle className="h-5 w-5 shrink-0 text-gold-400" /> {f.q}
            </h2>
            <p className="mt-2 pl-7 text-sm leading-relaxed text-parchment-dim">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
