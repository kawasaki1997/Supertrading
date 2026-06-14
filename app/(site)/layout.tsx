import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/session";
import { getCartCount } from "@/lib/cart";

// Nav reflects the current login state + cart, so render per-request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;
  return (
    <AppShell user={user} cartCount={cartCount}>
      {children}
    </AppShell>
  );
}
