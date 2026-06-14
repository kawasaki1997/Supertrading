import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCart } from "@/lib/cart";
import { CartView } from "@/components/cart/CartView";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giỏ hàng — Super Trading" };

export default async function CartPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const [user, cart] = await Promise.all([
    prisma.user.findUnique({ where: { id: me.id } }),
    getCart(me.id),
  ]);
  if (!user) redirect("/dang-nhap");

  const t = await getT();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-gold-400" />
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment">
          {t("cart.title")} {cart.count > 0 && <span className="text-muted">({cart.count})</span>}
        </h1>
      </div>

      <CartView lines={cart.lines} total={cart.total} balance={user.balance} />
    </div>
  );
}
