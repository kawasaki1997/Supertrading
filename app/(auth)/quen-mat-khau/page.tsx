import Link from "next/link";
import { Mail, MailCheck } from "lucide-react";
import { requestPasswordResetAction } from "@/lib/user-actions";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Quên mật khẩu — Super Trading" };

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const t = await getT();

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-4 rounded-2xl glass p-6 ring-gold">
        {sent ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-500/12 ring-1 ring-gold-500/25">
              <MailCheck className="h-7 w-7 text-gold-400" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment">
              {t("auth.checkEmail")}
            </h1>
            <p className="text-sm text-parchment-dim">{t("auth.checkEmailMsg")}</p>
            <Link
              href="/dang-nhap"
              className="inline-block font-semibold text-gold-400 hover:text-gold-300"
            >
              ← {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="space-y-4">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
                {t("auth.forgotTitle")}
              </h1>
              <p className="mt-1 text-xs text-muted">{t("auth.forgotSub")}</p>
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="email" type="email" required placeholder={t("auth.email")} aria-label={t("auth.email")} className={inputCls} />
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
            >
              {t("auth.sendReset")}
            </button>
            <p className="text-center text-xs text-muted">
              <Link href="/dang-nhap" className="font-semibold text-gold-400 hover:text-gold-300">
                ← {t("auth.backToLogin")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
