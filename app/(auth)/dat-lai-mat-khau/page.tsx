import Link from "next/link";
import { Lock, AlertCircle } from "lucide-react";
import { resetPasswordAction } from "@/lib/user-actions";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Reset Password — Super Trading" };

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const t = await getT();
  const invalid = !token || error === "invalid";
  const errorMsg =
    error === "short" ? t("auth.regShort") : error === "match" ? t("auth.regMatch") : null;

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-4 rounded-2xl glass p-6 ring-gold">
        {invalid ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-soft/12 ring-1 ring-rose-soft/25">
              <AlertCircle className="h-7 w-7 text-rose-soft" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment">
              {t("auth.linkInvalid")}
            </h1>
            <p className="text-sm text-parchment-dim">{t("auth.linkInvalidMsg")}</p>
            <Link
              href="/quen-mat-khau"
              className="inline-block font-semibold text-gold-400 hover:text-gold-300"
            >
              {t("auth.resendLink")} →
            </Link>
          </div>
        ) : (
          <form action={resetPasswordAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
                {t("auth.newPassword")}
              </h1>
              <p className="mt-1 text-xs text-muted">{t("auth.newPasswordSub")}</p>
            </div>

            {errorMsg && (
              <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-center text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
                {errorMsg}
              </p>
            )}

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="next" type="password" required placeholder={t("auth.newPasswordPh")} aria-label={t("auth.newPassword")} className={inputCls} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="confirm" type="password" required placeholder={t("auth.confirmNew")} aria-label={t("auth.confirmNew")} className={inputCls} />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
            >
              {t("auth.resetBtn")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
