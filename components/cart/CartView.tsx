"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, Gem, ShoppingBag, Loader2, Wallet } from "lucide-react";
import type { CartLine } from "@/lib/cart";
import {
  updateCartQtyAction,
  removeCartItemAction,
  checkoutAction,
} from "@/lib/cart-actions";

const checkoutErr: Record<string, string> = {
  balance: "Số dư không đủ. Hãy nạp thêm tiền.",
  stock: "Một số sản phẩm đã hết hàng — vui lòng cập nhật giỏ.",
  empty: "Giỏ hàng đang trống.",
};

export function CartView({
  lines,
  total,
  balance,
}: {
  lines: CartLine[];
  total: number;
  balance: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const enough = balance >= total;

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  function checkout() {
    if (!lines.length || !enough || pending) return;
    setErr(null);
    start(async () => {
      const res = await checkoutAction();
      if (res && !res.ok) {
        setErr(checkoutErr[res.error ?? ""] ?? "Có lỗi, thử lại.");
        router.refresh();
      }
    });
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl glass p-10 text-center">
        <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted" />
        <p className="text-sm text-muted">Giỏ hàng của bạn đang trống.</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Items */}
      <div className="space-y-3 lg:col-span-2">
        {lines.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-2xl glass p-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-royal-500/30 to-ink-700 ring-1 ring-gold-500/15">
              {l.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
              ) : (
                <Gem className="h-7 w-7 text-parchment/80" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base font-semibold text-parchment">{l.name}</p>
              <p className="text-sm text-gold-300">${l.price.toFixed(2)}</p>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-1 rounded-lg border border-gold-500/15 bg-ink-800/70 p-1">
              <button
                disabled={pending}
                onClick={() => run(() => updateCartQtyAction(l.id, l.qty - 1))}
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment"
                aria-label="Giảm"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-parchment">{l.qty}</span>
              <button
                disabled={pending || l.qty >= l.stock}
                onClick={() => run(() => updateCartQtyAction(l.id, l.qty + 1))}
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-parchment-dim transition-colors hover:bg-ink-700 hover:text-parchment disabled:opacity-40"
                aria-label="Tăng"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="hidden w-20 text-right font-display text-sm font-bold text-gold-grad sm:block">
              ${l.lineTotal.toFixed(2)}
            </div>

            <button
              disabled={pending}
              onClick={() => run(() => removeCartItemAction(l.id))}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-rose-soft/70 transition-colors hover:bg-rose-soft/10 hover:text-rose-soft"
              aria-label="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="h-fit space-y-4 rounded-2xl glass p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold text-parchment">Tổng kết</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-parchment-dim">
            <span>Tạm tính</span>
            <span className="font-semibold text-parchment">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-parchment-dim">
            <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-gold-400" /> Số dư</span>
            <span className="font-semibold text-parchment">${balance.toFixed(2)}</span>
          </div>
          <div className="rule-gold my-1" />
          <div className="flex justify-between">
            <span className="font-semibold text-parchment">Thanh toán</span>
            <span className="font-display text-xl font-bold text-gold-grad">${total.toFixed(2)}</span>
          </div>
        </div>

        {err && (
          <p className="rounded-lg bg-rose-soft/10 px-3 py-2 text-xs font-medium text-rose-soft ring-1 ring-rose-soft/25">
            {err}
          </p>
        )}

        {!enough && !err && (
          <p className="rounded-lg bg-gold-500/8 px-3 py-2 text-xs text-gold-300 ring-1 ring-gold-500/20">
            Số dư không đủ. <Link href="/nap-tien" className="font-semibold underline">Nạp thêm tiền</Link>.
          </p>
        )}

        <button
          onClick={checkout}
          disabled={pending || !enough}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          {pending ? "Đang xử lý" : "Thanh toán"}
        </button>

        <Link href="/" className="block text-center text-xs text-muted hover:text-parchment">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
