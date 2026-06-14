import Link from "next/link";
import { Lock, AlertCircle } from "lucide-react";
import { resetPasswordAction } from "@/lib/user-actions";

export const metadata = { title: "Đặt lại mật khẩu — Super Trading" };

const errors: Record<string, string> = {
  short: "Mật khẩu mới tối thiểu 6 ký tự.",
  match: "Mật khẩu nhập lại không khớp.",
};

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const invalid = !token || error === "invalid";

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-4 rounded-2xl glass p-6 ring-gold">
        {invalid ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-soft/12 ring-1 ring-rose-soft/25">
              <AlertCircle className="h-7 w-7 text-rose-soft" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment">
              Liên kết không hợp lệ
            </h1>
            <p className="text-sm text-parchment-dim">
              Link đặt lại mật khẩu không đúng hoặc đã hết hạn (sau 1 giờ). Vui
              lòng yêu cầu lại.
            </p>
            <Link
              href="/quen-mat-khau"
              className="inline-block font-semibold text-gold-400 hover:text-gold-300"
            >
              Gửi lại link đặt lại →
            </Link>
          </div>
        ) : (
          <form action={resetPasswordAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
                Đặt mật khẩu mới
              </h1>
              <p className="mt-1 text-xs text-muted">Nhập mật khẩu mới cho tài khoản</p>
            </div>

            {error && errors[error] && (
              <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-center text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
                {errors[error]}
              </p>
            )}

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="next" type="password" required placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" aria-label="Mật khẩu mới" className={inputCls} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="confirm" type="password" required placeholder="Nhập lại mật khẩu mới" aria-label="Nhập lại mật khẩu" className={inputCls} />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
            >
              Đặt lại mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
