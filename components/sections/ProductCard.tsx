"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Check, Gem, Loader2, Plus, Minus, X, Hand } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UIProduct } from "@/lib/types";
import { buyProductAction } from "@/lib/order-actions";
import { addToCartAction } from "@/lib/cart-actions";
import { useT } from "@/components/i18n/LangProvider";
import { formatPrice } from "@/lib/format";

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
  const [buyModal, setBuyModal] = useState(false);
  const [gameUsername, setGameUsername] = useState("");
  const [gameNote, setGameNote] = useState("");
  const [qty, setQty] = useState(1);
  const out = product.stock === 0;
  const manual = product.deliveryType === "MANUAL";
  const tint = tints[index % tints.length];

  function setQtyClamped(n: number) {
    setQty(Math.max(1, Math.min(n, product.stock || 1)));
  }

  function addCart() {
    if (out || cartPending) return;
    setErr(null);
    startCart(async () => {
      const res = await addToCartAction(product.id, qty);
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
    // Vật phẩm giao tay → mở modal nhập nick game trước khi thanh toán.
    if (manual) {
      setErr(null);
      setBuyModal(true);
      return;
    }
    if (!confirm(`${product.name} ×${qty} — $${formatPrice(product.price * qty)}\n${t("product.confirmBuy")}`)) return;
    doBuy();
  }

  function doBuy() {
    setErr(null);
    startTransition(async () => {
      const res = await buyProductAction(
        product.id,
        manual ? { gameUsername, gameNote, qty } : { qty },
      );
      if (res.ok) {
        setDone(true);
        setBuyModal(false);
        // Đưa khách thẳng tới trang đơn hàng để nhận dữ liệu / theo dõi giao hàng
        router.push(`/don-hang/${res.code}`);
      } else {
        setErr(res.error ? t(`err.${res.error}`) : t("err.generic"));
        if (!manual) setTimeout(() => setErr(null), 3500);
      }
    });
  }

  return (
    <>
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
          {manual && (
            <span className="inline-flex items-center gap-1 rounded-full bg-royal-500/15 px-2 py-0.5 font-medium text-royal-300 ring-1 ring-royal-400/25">
              <Hand className="h-3 w-3" /> {t("product.manualBadge")}
            </span>
          )}
        </div>

        {!out && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-muted">{t("common.quantity")}</span>
            <div className="flex items-center gap-0.5 rounded-lg border border-gold-500/15 bg-ink-800/70 p-0.5">
              <button
                type="button"
                onClick={() => setQtyClamped(qty - 1)}
                disabled={qty <= 1}
                aria-label="-"
                className="grid h-6 w-6 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                value={qty}
                onChange={(e) => setQtyClamped(parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)}
                inputMode="numeric"
                aria-label={t("common.quantity")}
                className="w-9 bg-transparent text-center text-sm font-semibold text-parchment outline-none"
              />
              <button
                type="button"
                onClick={() => setQtyClamped(qty + 1)}
                disabled={qty >= product.stock}
                aria-label="+"
                className="grid h-6 w-6 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto">
          {err && (
            <p className="mb-1 text-[11px] font-medium text-rose-soft">{err}</p>
          )}
          <div className="flex items-end justify-between pt-2">
            <div className="leading-none">
              {product.oldPrice && (
                <span className="mr-1.5 text-xs text-muted line-through">
                  ${formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="font-display text-xl font-bold tracking-wide text-gold-grad">
                ${formatPrice(product.price)}
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

    {buyModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        onClick={() => !pending && setBuyModal(false)}
      >
        <div
          className="my-8 w-full max-w-md rounded-2xl glass-strong p-6 ring-gold"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-parchment">{t("buy.title")}</h3>
              <p className="mt-0.5 font-serif text-sm text-parchment-dim">
                {product.name} —{" "}
                <span className="font-bold text-gold-300">${formatPrice(product.price * qty)}</span>
                {qty > 1 && (
                  <span className="text-muted"> ({qty} × ${formatPrice(product.price)})</span>
                )}
              </p>
            </div>
            <button
              onClick={() => !pending && setBuyModal(false)}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-ink-700 hover:text-parchment"
              aria-label={t("common.cancel")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex items-start gap-2 rounded-xl bg-royal-500/10 p-3 text-xs text-royal-200 ring-1 ring-royal-400/20">
            <Hand className="mt-0.5 h-4 w-4 shrink-0 text-royal-300" />
            <p>{t("buy.gameHint")}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!gameUsername.trim() || pending) return;
              doBuy();
            }}
            className="space-y-3"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold text-parchment-dim">
                {t("common.quantity")}
              </label>
              <div className="flex w-fit items-center gap-1 rounded-lg border border-gold-500/15 bg-ink-800/70 p-1">
                <button
                  type="button"
                  onClick={() => setQtyClamped(qty - 1)}
                  disabled={qty <= 1}
                  className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  value={qty}
                  onChange={(e) => setQtyClamped(parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)}
                  inputMode="numeric"
                  className="w-12 bg-transparent text-center text-sm font-semibold text-parchment outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQtyClamped(qty + 1)}
                  disabled={qty >= product.stock}
                  className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-parchment-dim">
                {t("buy.gameUsername")} *
              </label>
              <input
                value={gameUsername}
                onChange={(e) => setGameUsername(e.target.value)}
                required
                autoFocus
                placeholder={t("buy.gameUsernamePh")}
                className="h-10 w-full rounded-lg border border-gold-500/15 bg-ink-800/70 px-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-parchment-dim">
                {t("buy.gameNote")}
              </label>
              <textarea
                value={gameNote}
                onChange={(e) => setGameNote(e.target.value)}
                rows={2}
                placeholder={t("buy.gameNotePh")}
                className="w-full rounded-lg border border-gold-500/15 bg-ink-800/70 p-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
              />
            </div>

            {err && <p className="text-xs font-medium text-rose-soft">{err}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => !pending && setBuyModal(false)}
                className="cursor-pointer rounded-lg bg-ink-800/70 px-4 py-2.5 text-sm font-semibold text-parchment-dim ring-1 ring-gold-500/12 transition-colors hover:text-parchment"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={pending || !gameUsername.trim()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                {pending ? t("common.processing") : t("buy.confirm")}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
