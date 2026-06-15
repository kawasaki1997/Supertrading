"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, CheckCircle2, Search } from "lucide-react";
import { checkDepositAction } from "@/lib/deposit-actions";
import { useT } from "@/components/i18n/LangProvider";

export function DepositWatcher({ code }: { code: string }) {
  const t = useT();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [notYet, setNotYet] = useState(false);
  const busy = useRef(false);

  async function check(manual = false) {
    if (busy.current || done) return;
    busy.current = true;
    if (manual) setChecking(true);
    try {
      const res = await checkDepositAction(code);
      if (res.status === "COMPLETED") {
        setDone(true);
        router.refresh(); // server page hiện trạng thái "đã cộng tiền" + balance mới
      } else if (manual) {
        setNotYet(true);
        setTimeout(() => setNotYet(false), 6000);
      }
    } catch {
      /* bỏ qua, lần poll sau thử lại */
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }

  // Tự động dò mỗi 15s khi đang chờ
  useEffect(() => {
    const id = setInterval(() => check(false), 15000);
    const first = setTimeout(() => check(false), 3000);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-soft/10 p-3 text-sm font-medium text-emerald-soft ring-1 ring-emerald-soft/25">
        <CheckCircle2 className="h-4 w-4" /> {t("deposit.creditedNow")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => check(true)}
        disabled={checking}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 py-3 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:opacity-70"
      >
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {checking ? t("deposit.checking") : t("deposit.checkNow")}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
        <RefreshCw className="h-3 w-3 animate-spin [animation-duration:3s]" /> {t("deposit.autoChecking")}
      </p>
      {notYet && (
        <p className="rounded-lg bg-gold-500/8 px-3 py-2 text-center text-xs text-gold-300 ring-1 ring-gold-500/20">
          {t("deposit.notYet")}
        </p>
      )}
    </div>
  );
}
