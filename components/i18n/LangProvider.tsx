"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { setLocale } from "@/lib/i18n-actions";
import type { Locale } from "@/lib/i18n";

type Dict = Record<string, string>;
type Ctx = { dict: Dict; locale: Locale };

const LangCtx = createContext<Ctx>({ dict: {}, locale: "vi" });

export function LangProvider({
  dict,
  locale,
  children,
}: {
  dict: Dict;
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LangCtx.Provider value={{ dict, locale }}>{children}</LangCtx.Provider>;
}

/** Client-side translator hook. */
export function useT() {
  const { dict } = useContext(LangCtx);
  return (key: string) => dict[key] ?? key;
}

export function useLocale() {
  return useContext(LangCtx).locale;
}

/** Language toggle button for the nav (VI ⇄ EN). */
export function LangSwitch() {
  const { locale } = useContext(LangCtx);
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Locale = locale === "vi" ? "en" : "vi";

  return (
    <button
      onClick={() =>
        start(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      disabled={pending}
      className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-gold-500/12 bg-ink-800/70 px-2.5 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:border-gold-500/30 hover:text-parchment disabled:opacity-50 lg:flex"
      aria-label="Đổi ngôn ngữ / Switch language"
    >
      <span className="text-base leading-none">{locale === "vi" ? "🇻🇳" : "🇬🇧"}</span>
      {locale === "vi" ? "VI" : "EN"}
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
    </button>
  );
}
