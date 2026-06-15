"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Wallet,
  ScrollText,
  AlertTriangle,
  History,
  Bell,
  MessageSquare,
  BookOpen,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  ShoppingCart,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/brand/DragonLogo";
import { logoutUserAction } from "@/lib/user-actions";
import type { SessionUser } from "@/lib/types";
import { useT, LangSwitch } from "@/components/i18n/LangProvider";

type NavItem = { key: string; icon: LucideIcon; href?: string; badge?: number };

const nav: NavItem[] = [
  { key: "nav.shop", icon: Store, href: "/" },
  { key: "nav.deposit", icon: Wallet, href: "/nap-tien" },
  { key: "nav.orders", icon: ScrollText, href: "/don-hang" },
  { key: "nav.complaints", icon: AlertTriangle, href: "/khieu-nai" },
  { key: "nav.transactions", icon: History, href: "/giao-dich" },
  { key: "nav.notifications", icon: Bell, href: "/thong-bao" },
  { key: "nav.support", icon: MessageSquare, href: "/ho-tro" },
  { key: "nav.guide", icon: BookOpen, href: "/huong-dan" },
];

export function TopNav({
  user,
  cartCount,
  notifCount,
}: {
  user: SessionUser | null;
  cartCount: number;
  notifCount: number;
}) {
  const pathname = usePathname();
  const t = useT();
  const [activePlaceholder, setActivePlaceholder] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.href ? pathname === item.href : activePlaceholder === item.key;
  const badgeFor = (item: NavItem) =>
    item.key === "nav.notifications" && notifCount > 0 ? notifCount : item.badge;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/12 bg-ink-950/80 backdrop-blur-xl">
      {/* ---- Tier 1 ---- */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Brand href="/" />

        <form action="/tim-kiem" className="group relative ml-2 hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted transition-colors group-focus-within:text-gold-400" />
          <input
            type="text"
            name="q"
            placeholder={t("nav.searchPlaceholder")}
            aria-label={t("nav.searchPlaceholder")}
            className="h-10 w-full rounded-xl border border-gold-500/12 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-all duration-200 focus:border-gold-500/40 focus:bg-ink-800 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <LangSwitch />

          {user ? (
            <>
              <Link
                href="/nap-tien"
                className="flex items-center gap-2 rounded-lg border border-gold-500/25 bg-gradient-to-r from-gold-500/12 to-royal-500/8 px-3 py-2 transition-colors hover:border-gold-500/45"
              >
                <Wallet className="h-4 w-4 text-gold-400" />
                <span className="font-display text-sm font-bold tracking-wide text-gold-grad">
                  ${user.balance.toFixed(2)}
                </span>
              </Link>

              <Link
                href="/gio-hang"
                className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-gold-500/12 bg-ink-800/70 text-parchment-dim transition-colors hover:border-gold-500/30 hover:text-parchment"
                aria-label={t("cart.title")}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink-950">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/ho-so"
                className="hidden items-center gap-2.5 rounded-xl border border-gold-500/12 bg-ink-800/70 py-1.5 pl-1.5 pr-3 transition-colors hover:border-gold-500/30 sm:flex"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-royal-500 text-xs font-bold text-ink-950">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 text-left leading-tight">
                  <span className="block truncate text-xs font-semibold text-parchment">
                    {user.name}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    {user.role === "admin" ? t("role.admin") : t("role.customer")}
                  </span>
                </span>
              </Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/dang-nhap"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/15 bg-ink-800/70 px-3.5 py-2 text-xs font-semibold text-parchment-dim transition-colors hover:text-parchment"
              >
                <LogIn className="h-4 w-4" /> {t("nav.login")}
              </Link>
              <Link
                href="/dang-ky"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-3.5 py-2 text-xs font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
              >
                <UserPlus className="h-4 w-4" /> {t("nav.register")}
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-gold-500/12 bg-ink-800/70 text-parchment-dim transition-colors hover:text-parchment lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ---- Tier 2 (desktop) ---- */}
      <div className="hidden border-t border-gold-500/8 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6">
          <nav className="flex items-center gap-0.5">
            {nav.map((item) => {
              const active = isActive(item);
              const cls = `group relative flex cursor-pointer items-center gap-2 px-3.5 py-3 text-sm font-medium transition-colors duration-200 ${
                active ? "text-parchment" : "text-parchment-dim hover:text-parchment"
              }`;
              const inner = (
                <>
                  <item.icon
                    className={`h-[17px] w-[17px] transition-colors ${
                      active ? "text-gold-400" : "text-muted group-hover:text-gold-300"
                    }`}
                  />
                  {t(item.key)}
                  {badgeFor(item) && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-royal-500/80 px-1 text-[10px] font-bold text-white">
                      {badgeFor(item)}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="topnav-active"
                      className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-gold-300 to-gold-600"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                </>
              );
              return item.href ? (
                <Link key={item.key} href={item.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button key={item.key} onClick={() => setActivePlaceholder(item.key)} className={cls}>
                  {inner}
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/ho-so"
                  className="flex cursor-pointer items-center gap-2 px-3 py-3 text-sm font-medium text-parchment-dim transition-colors hover:text-parchment"
                >
                  <User className="h-[17px] w-[17px] text-muted" />
                  {t("nav.profile")}
                </Link>
                <form action={logoutUserAction}>
                  <button className="flex cursor-pointer items-center gap-2 px-3 py-3 text-sm font-medium text-rose-soft/80 transition-colors hover:text-rose-soft">
                    <LogOut className="h-[17px] w-[17px]" />
                    {t("nav.logout")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/dang-nhap"
                  className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-parchment-dim transition-colors hover:text-parchment"
                >
                  <LogIn className="h-[17px] w-[17px] text-muted" />
                  {t("nav.login")}
                </Link>
                <Link
                  href="/dang-ky"
                  className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-gold-400 transition-colors hover:text-gold-300"
                >
                  <UserPlus className="h-[17px] w-[17px]" />
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---- Mobile drawer ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-gold-500/10 lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <form action="/tim-kiem" onSubmit={() => setMobileOpen(false)} className="group relative mb-3">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  name="q"
                  placeholder={t("nav.searchPlaceholder")}
                  aria-label={t("nav.searchPlaceholder")}
                  className="h-10 w-full rounded-xl border border-gold-500/12 bg-ink-800/70 pl-11 pr-4 text-sm text-parchment placeholder:text-muted outline-none focus:border-gold-500/40"
                />
              </form>

              {user && (
                <Link
                  href="/ho-so"
                  onClick={() => setMobileOpen(false)}
                  className="mb-3 flex items-center gap-3 rounded-xl bg-ink-800/60 p-3 ring-1 ring-gold-500/12"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-royal-500 text-sm font-bold text-ink-950">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-parchment">{user.name}</p>
                    <p className="text-xs text-muted">
                      {t("common.balance")}: ${user.balance.toFixed(2)}
                    </p>
                  </div>
                </Link>
              )}

              {nav.map((item) => {
                const active = isActive(item);
                const cls = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gradient-to-r from-gold-500/18 to-royal-500/10 text-parchment ring-1 ring-gold-500/25"
                    : "text-parchment-dim hover:bg-ink-700"
                }`;
                const inner = (
                  <>
                    <item.icon className={`h-[18px] w-[18px] ${active ? "text-gold-400" : "text-muted"}`} />
                    <span className="flex-1 text-left">{t(item.key)}</span>
                    {badgeFor(item) && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-royal-500/80 px-1.5 text-[10px] font-bold text-white">
                        {badgeFor(item)}
                      </span>
                    )}
                  </>
                );
                return item.href ? (
                  <Link key={item.key} href={item.href} onClick={() => setMobileOpen(false)} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActivePlaceholder(item.key);
                      setMobileOpen(false);
                    }}
                    className={cls}
                  >
                    {inner}
                  </button>
                );
              })}

              <div className="rule-gold my-2" />

              {user ? (
                <form action={logoutUserAction}>
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-soft/80 hover:bg-rose-soft/10">
                    <LogOut className="h-[18px] w-[18px]" /> {t("nav.logout")}
                  </button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/dang-nhap"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold-500/15 bg-ink-800/70 px-3 py-2.5 text-sm font-semibold text-parchment-dim"
                  >
                    <LogIn className="h-[18px] w-[18px]" /> {t("nav.login")}
                  </Link>
                  <Link
                    href="/dang-ky"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-3 py-2.5 text-sm font-bold text-ink-950"
                  >
                    <UserPlus className="h-[18px] w-[18px]" /> {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
