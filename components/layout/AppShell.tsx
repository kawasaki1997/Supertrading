"use client";

import type { SessionUser } from "@/lib/types";
import { TopNav } from "./TopNav";

export function AppShell({
  children,
  user,
  cartCount,
  notifCount,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
  cartCount: number;
  notifCount: number;
}) {
  return (
    <div className="min-h-screen">
      <TopNav user={user} cartCount={cartCount} notifCount={notifCount} />
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
