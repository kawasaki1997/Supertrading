"use client";

import { useState } from "react";
import { DollarSign, Coins, ArrowRight } from "lucide-react";
import { createDepositAction } from "@/lib/deposit-actions";
import { useT } from "@/components/i18n/LangProvider";

export type MethodOption = {
  key: string;
  label: string;
  network: string;
  symbol: string;
  usdPerUnit: number;
};

const QUICK = [5, 10, 20, 50, 100];

export function DepositForm({ methods }: { methods: MethodOption[] }) {
  const t = useT();
  const [method, setMethod] = useState(methods[0]?.key ?? "");
  const [amount, setAmount] = useState(5);

  const selected = methods.find((m) => m.key === method) ?? methods[0];
  const isVnd = selected?.symbol === "VND";
  const send = selected ? amount / selected.usdPerUnit : 0;
  const sendStr = isVnd
    ? Math.round(send).toLocaleString("vi-VN") + "đ"
    : selected?.symbol === "USDT"
      ? send.toFixed(2)
      : send.toFixed(6);

  return (
    <form action={createDepositAction} className="space-y-6">
      <input type="hidden" name="method" value={method} />

      {/* Method */}
      <div>
        <p className="mb-2 text-sm font-semibold text-parchment-dim">{t("deposit.method")}</p>
        <div className="grid grid-cols-2 gap-3">
          {methods.map((m) => {
            const active = m.key === method;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-gold-500/18 to-royal-500/10 text-parchment ring-1 ring-gold-500/40"
                    : "bg-ink-800/60 text-parchment-dim ring-1 ring-gold-500/12 hover:text-parchment"
                }`}
              >
                <Coins className={`h-4 w-4 ${active ? "text-gold-400" : "text-muted"}`} />
                {m.label}
                <span className="text-[11px] text-muted">({m.network})</span>
              </button>
            );
          })}
        </div>
        {selected && (
          <p className="mt-2 text-xs text-muted">
            {isVnd
              ? `1 USD = ${Math.round(1 / selected.usdPerUnit).toLocaleString("vi-VN")} VND`
              : `${t("deposit.rate")}: 1 ${selected.symbol} = $${selected.usdPerUnit.toLocaleString("en-US")}`}
          </p>
        )}
      </div>

      {/* Quick amounts */}
      <div>
        <p className="mb-2 text-sm font-semibold text-parchment-dim">{t("deposit.quickAmount")}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                amount === q
                  ? "bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950"
                  : "bg-ink-800/60 text-parchment-dim ring-1 ring-gold-500/12 hover:text-parchment"
              }`}
            >
              ${q}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div>
        <p className="mb-2 text-sm font-semibold text-parchment-dim">{t("deposit.customAmount")}</p>
        <div className="relative">
          <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input
            name="amount"
            type="number"
            min={1}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-12 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 pl-11 pr-16 text-base font-semibold text-parchment outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
            USD
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2 rounded-xl border border-gold-500/15 bg-ink-800/40 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-parchment-dim">{t("deposit.needSend")}:</span>
          <span className="font-display font-bold text-parchment">
            {sendStr}{isVnd ? "" : ` ${selected?.symbol}`}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-parchment-dim">{t("deposit.youGet")}:</span>
          <span className="font-display text-lg font-bold text-gold-grad">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!amount || amount < 1}
        className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3.5 text-sm font-bold tracking-wide text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("deposit.createOrder")} ${amount.toFixed(2)}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
