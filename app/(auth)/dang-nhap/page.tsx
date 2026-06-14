import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { loginAction } from "@/lib/user-actions";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Đăng nhập — Super Trading" };

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  const t = await getT();
  const errorMsg =
    error === "missing"
      ? t("auth.loginMissing")
      : error === "invalid"
        ? t("auth.loginInvalid")
        : null;

  return (
    <div className="w-full max-w-sm">
      <form action={loginAction} className="space-y-4 rounded-2xl glass p-6 ring-gold">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
            {t("auth.login")}
          </h1>
          <p className="mt-1 text-xs text-muted">{t("auth.loginSub")}</p>
        </div>

        {reset && (
          <p className="rounded-lg bg-emerald-soft/10 px-3 py-2 text-center text-xs font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
            {t("auth.resetSuccess")}
          </p>
        )}

        {errorMsg && (
          <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-center text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
            {errorMsg}
          </p>
        )}

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="email" type="email" required placeholder={t("auth.email")} aria-label={t("auth.email")} className={inputCls} />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="password" type="password" required placeholder={t("auth.password")} aria-label={t("auth.password")} className={inputCls} />
        </div>

        <div className="text-right">
          <Link href="/quen-mat-khau" className="text-xs font-medium text-gold-400 hover:text-gold-300">
            {t("auth.forgot")}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
        >
          {t("auth.login")}
        </button>

        <p className="text-center text-xs text-muted">
          {t("auth.noAccount")}{" "}
          <Link href="/dang-ky" className="font-semibold text-gold-400 hover:text-gold-300">
            {t("auth.registerNow")}
          </Link>
        </p>
      </form>
    </div>
  );
}
