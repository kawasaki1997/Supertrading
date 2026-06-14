import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand/DragonLogo";
import { logoutAction } from "./actions";
import { isAuthed } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthed();

  // Login page (not authed): render bare, no admin chrome.
  if (!authed) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-gold-500/12 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Brand size="sm" />
          <span className="hidden items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-300 ring-1 ring-gold-500/25 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trang quản trị
          </span>
          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment"
            >
              Sản phẩm
            </Link>
            <Link
              href="/admin/deposits"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment"
            >
              Lệnh nạp
            </Link>
            <Link
              href="/admin/reports"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment"
            >
              Báo lỗi
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/15 bg-ink-800/70 px-3 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:text-parchment"
            >
              <ExternalLink className="h-4 w-4" /> Xem website
            </Link>
            <form action={logoutAction}>
              <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-soft/25 bg-rose-soft/10 px-3 py-2 text-xs font-semibold text-rose-soft transition-colors hover:bg-rose-soft/20">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
