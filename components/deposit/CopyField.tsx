"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-gold-500/15 bg-ink-800/70 p-2 pl-3.5">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-parchment">{value}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
            copied
              ? "bg-emerald-soft/90 text-ink-950"
              : "bg-gold-500/15 text-gold-300 hover:bg-gold-500/25"
          }`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Đã chép" : "Chép"}
        </button>
      </div>
    </div>
  );
}
