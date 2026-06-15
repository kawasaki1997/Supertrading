"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Check, Gem, Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UIProduct } from "@/lib/types";
import { buyProductAction } from "@/lib/order-actions";
import { addToCartAction } from "@/lib/cart-actions";
import { useT } from "@/components/i18n/LangProvider";

const badgeStyles: Record<string, string> = {
  HOT: "bg-rose-soft/15 text-rose-soft ring-rose-soft/30",
  NEW: "bg-royal-500/20 text-royal-300 ring-royal-400/30",
  "-50%": "bg-gold-500/18 text-gold-300 ring-gold-500/40",
  LIMITED: "bg-gold-500/15 text-gold-200 ring-gold-500/40",
};

const tints = [
  "from-royal-500/40 to-ink-700",
  "from-gold-500/40 to-ink-700",
  "from-royal-400/40 to-ink-700",
  "from-gold-400/40 to-ink-700",
];

export function ProductCard({
  product,
  index,
}: {
  product: UIProduct;
  index: number;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cartPending, startCart] = useTransition();
  const [done, setDone] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const out = product.stock === 0;
  const tint = tints[index % tints.length];

  function addCart() {
    if (out || cartPending) return;
    setErr(null);
    startCart(async () => {
      const res = await addToCartAction(product.id);
      if (res.ok) {
        setCartAdded(true);
        router.refresh();
        setTimeout(() => setCartAdded(false), 1500);
      } else {
        setErr(res.error ? t(`err.${res.error}`) : t("err.generic"));
        setTimeout(() => setErr(null), 3500);
      }
    });
  }

  function buy() {
    if (out || pending) return;
    if (!confirm(`${product.name} — $${product.price.toFixed(2)}\n${t("product.confirmBuy")}`)) return;
    setErr(null);
    startTransition(async () => {
      const res = await buyProductAction(product.id);
      if (res.ok) {
        setDone(true);
        // Đưa khách thẳng tới trang đơn hàng để nhận dữ liệu tài khoản ngay
        router.push(`/don-hang/${res.code}`);
      } else {
        setErr(res.error ? t(`err.${res.error}`) : t("err.generic"));
        setTimeout(() => setErr(null), 3500);
      }
    });
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex gap-4 overflow-hidden rounded-2xl glass p-3.5 transition-all duration-300 ${
        out ? "opacity-60" : "hover:-translate-y-1 hover:glow-gold"
      }`}
    >
      {/* Artwork tile */}
      <div
        className={`relative grid h-[88px] w-[88px] shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${tint} ring-1 ring-gold-500/15`}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_60%)]" />
            <Gem className="h-9 w-9 text-parchment/90 drop-shadow transition-transform duration-500 group-hover:scale-110" />
          </>
        )}
        {product.badge && badgeStyles[product.badge] && (
          <span
            className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {out && (
          <span className="absolute inset-0 grid place-items-center bg-ink-950/70 text-[10px] font-bold uppercase tracking-widest text-muted">
            {t("common.outOfStock")}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate font-serif text-lg font-semibold text-parchment">
          {product.name}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ring-1 ${
              out ? "text-muted ring-ink-600" : "text-emerald-soft ring-emerald-soft/25"
            }`}
            style={!out ? { background: "color-mix(in srgb, var(--color-emerald-soft) 12%, transparent)" } : undefined}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: out ? "var(--color-muted)" : "var(--color-emerald-soft)" }}
            />
            {out ? t("common.outOfStock") : `${t("common.inStock")} ${product.stock}`}
          </span>
          <span className="rounded-full bg-ink-700/60 px-2 py-0.5 text-muted">
            {t("common.soldCount")} {product.sold}
          </span>
        </div>

        <div className="mt-auto">
          {err && (
            <p className="mb-1 text-[11px] font-medium text-rose-soft">{err}</p>
          )}
          <div className="flex items-end justify-between pt-2">
            <div className="leading-none">
              {product.oldPrice && (
                <span className="mr-1.5 text-xs text-muted line-through">
                  ${product.oldPrice.toFixed(2)}
                </span>
              )}
              <span className="font-display text-xl font-bold tracking-wide text-gold-grad">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={out || cartPending}
                onClick={addCart}
                aria-label={t("common.addToCart")}
                title={t("common.addToCart")}
                className={`grid h-[34px] w-[34px] place-items-center rounded-lg transition-all duration-200 ${
                  out
                    ? "cursor-not-allowed bg-ink-700/60 text-muted"
                    : cartAdded
                      ? "bg-emerald-soft/90 text-ink-950"
                      : "cursor-pointer border border-gold-500/30 bg-ink-800/70 text-gold-300 hover:bg-gold-500/15"
                }`}
              >
                {cartPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : cartAdded ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>

              <button
                disabled={out || pending}
                onClick={buy}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                  out
                    ? "cursor-not-allowed bg-ink-700/60 text-muted"
                    : done
                      ? "bg-emerald-soft/90 text-ink-950"
                      : "cursor-pointer bg-gradient-to-b from-gold-300 to-gold-600 text-ink-950 hover:from-gold-200 hover:to-gold-500 disabled:opacity-70"
                }`}
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("common.processing")}
                  </>
                ) : done ? (
                  <>
                    <Check className="h-4 w-4" /> {t("common.bought")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> {t("common.buyNow")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
