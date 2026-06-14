import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { registerAction } from "@/lib/user-actions";

export const metadata = { title: "Đăng ký — Super Trading" };

const errors: Record<string, string> = {
  missing: "Vui lòng điền đầy đủ thông tin.",
  email: "Email không hợp lệ.",
  short: "Mật khẩu tối thiểu 6 ký tự.",
  match: "Mật khẩu nhập lại không khớp.",
  exists: "Email này đã được đăng ký.",
};

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <form action={registerAction} className="space-y-4 rounded-2xl glass p-6 ring-gold">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
            Tạo tài khoản
          </h1>
          <p className="mt-1 text-xs text-muted">
            Đăng ký để mua hàng, nạp tiền và theo dõi đơn
          </p>
        </div>

        {error && errors[error] && (
          <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-center text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
            {errors[error]}
          </p>
        )}

        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="name" required placeholder="Tên hiển thị" aria-label="Tên" className={inputCls} />
        </div>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="email" type="email" required placeholder="Email" aria-label="Email" className={inputCls} />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="password" type="password" required placeholder="Mật khẩu (tối thiểu 6 ký tự)" aria-label="Mật khẩu" className={inputCls} />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input name="confirm" type="password" required placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" className={inputCls} />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
        >
          Đăng ký
        </button>

        <p className="text-center text-xs text-muted">
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="font-semibold text-gold-400 hover:text-gold-300">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
