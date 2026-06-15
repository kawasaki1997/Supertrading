import { Lock } from "lucide-react";
import { Brand } from "@/components/brand/DragonLogo";
import { loginAction } from "../actions";

export const metadata = { title: "Admin Login — Super Trading" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <form
          action={loginAction}
          className="space-y-4 rounded-2xl glass p-6 ring-gold"
        >
          <div className="text-center">
            <h1 className="font-display text-xl font-bold tracking-wide text-parchment">
              Đăng nhập quản trị
            </h1>
            <p className="mt-1 text-xs text-muted">
              Nhập mật khẩu admin để quản lý cửa hàng
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-center text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
              Mật khẩu không đúng. Vui lòng thử lại.
            </p>
          )}

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Mật khẩu"
              aria-label="Mật khẩu"
              className="h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted">
          Mật khẩu mặc định: <span className="text-parchment-dim">admin123</span>{" "}
          — đổi trong file <span className="text-parchment-dim">.env</span>
        </p>
      </div>
    </div>
  );
}
