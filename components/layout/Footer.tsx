import { MessageCircle } from "lucide-react";
import { Brand } from "@/components/brand/DragonLogo";
import { getT } from "@/lib/i18n";

export async function Footer() {
  const t = await getT();
  return (
    <footer className="mt-4 overflow-hidden rounded-3xl glass">
      <div className="rule-gold" />
      <div className="grid gap-8 p-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Brand size="sm" />
          <p className="mt-3 max-w-xs font-serif text-sm text-parchment-dim">
            {t("footer.tagline")}
          </p>
        </div>

        {[
          { h: t("footer.colShop"), links: ["Robux", "Blox Fruits", t("footer.accounts"), t("footer.raidService")] },
          { h: t("footer.colSupport"), links: [t("footer.howToBuy"), t("footer.warranty"), t("footer.complaints"), t("footer.contact")] },
          { h: t("footer.colCommunity"), links: ["Discord", "Facebook", "TikTok", t("footer.reviews")] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
              {col.h}
            </h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-parchment-dim transition-colors hover:text-parchment"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-gold-500/10 px-8 py-5 sm:flex-row">
        <p className="text-xs text-muted">
          © 2026 Super Trading. {t("footer.rights")}
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-lg glass px-3.5 py-2 text-xs font-semibold text-parchment ring-gold transition-colors hover:text-gold-300"
        >
          <MessageCircle className="h-4 w-4 text-gold-400" />
          discord.gg/SuperTrading
        </a>
      </div>
    </footer>
  );
}
