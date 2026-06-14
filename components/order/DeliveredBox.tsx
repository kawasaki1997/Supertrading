"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { useT } from "@/components/i18n/LangProvider";

export function DeliveredBox({
  content,
  code,
}: {
  content: string;
  code: string;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  function download() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gold-500/15 bg-ink-950/60 p-4 font-mono text-sm text-parchment">
        {content}
      </pre>
      <div className="flex gap-2">
        <button
          onClick={() => {
            navigator.clipboard?.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            copied ? "bg-emerald-soft/90 text-ink-950" : "bg-gold-500/15 text-gold-300 hover:bg-gold-500/25"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t("order.copied") : t("order.copyData")}
        </button>
        <button
          onClick={download}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500"
        >
          <Download className="h-4 w-4" /> {t("order.download")}
        </button>
      </div>
    </div>
  );
}
