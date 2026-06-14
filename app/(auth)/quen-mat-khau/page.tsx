import Link from "next/link";
import { Mail, MailCheck } from "lucide-react";
import { requestPasswordResetAction } from "@/lib/user-actions";

export const metadata = { title: "Quên mật khẩu — Super Trading" };

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-4 rounded-2xl glass p-6 ring-gold">
        {sent ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-500/12 ring-1 ring-gold-500/25">
              <MailCheck className="h-7 w-7 text-gold-400" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment">
              Kiểm tra email
            </h1>
            <p className="text-sm text-parchment-dim">
              Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật
              khẩu (hết hạn sau 1 giờ). Vui lòng kiểm tra hộp thư.
            </p>
            <p className="text-[11px] text-muted">
              (Bản chạy local: link reset hiện ở console của server)
            </p>
            <Link
              href="/dang-nhap"
              className="inline-block font-semibold text-gold-400 hover:text-gold-300"
            >
              ← Về đăng nhập
            </Link>
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="space-y-4">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
                Quên mật khẩu
              </h1>
              <p className="mt-1 text-xs text-muted">
                Nhập email, chúng tôi sẽ gửi link đặt lại mật khẩu
              </p>
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <input name="email" type="email" required placeholder="Email tài khoản" aria-label="Email" className={inputCls} />
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
            >
              Gửi link đặt lại
            </button>
            <p className="text-center text-xs text-muted">
              <Link href="/dang-nhap" className="font-semibold text-gold-400 hover:text-gold-300">
                ← Quay lại đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
