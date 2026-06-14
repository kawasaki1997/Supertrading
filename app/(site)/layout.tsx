import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/session";
import { getCartCount } from "@/lib/cart";
import { LangProvider } from "@/components/i18n/LangProvider";
import { getLocale, getDict } from "@/lib/i18n";

// Nav reflects login state + cart + locale, so render per-request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <LangProvider dict={getDict(locale)} locale={locale}>
      <AppShell user={user} cartCount={cartCount}>
        {children}
      </AppShell>
    </LangProvider>
  );
}
