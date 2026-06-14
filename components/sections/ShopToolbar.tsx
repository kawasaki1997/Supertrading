"use client";

import { useState } from "react";
import { LayoutGrid, SlidersHorizontal } from "lucide-react";

type Chip = { id: string; title: string; slug: string };

export function ShopToolbar({
  categories,
  total,
}: {
  categories: Chip[];
  total: number;
}) {
  const [active, setActive] = useState("all");
  const chips = [{ id: "all", title: "Tất cả", slug: "all" }, ...categories];

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-800/70 ring-1 ring-gold-500/15">
          <LayoutGrid className="h-[18px] w-[18px] text-gold-400" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide text-parchment">
            Cửa hàng
          </h2>
          <p className="text-xs text-muted">{total} sản phẩm đang bán</p>
        </div>
      </div>

      <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:justify-center [scrollbar-width:none]">
        {chips.map((c) => {
          const isActive = active === c.id;
          return (
            <a
              key={c.id}
              href={c.slug === "all" ? "#" : `#${c.slug}`}
              onClick={() => setActive(c.id)}
              className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-gold-400 to-gold-600 text-ink-950"
                  : "bg-ink-800/60 text-parchment-dim ring-1 ring-gold-500/12 hover:text-parchment"
              }`}
            >
              {c.title.split(" — ")[0]}
            </a>
          );
        })}
      </div>

      <button className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink-800/70 px-3.5 py-2 text-xs font-semibold text-parchment-dim ring-1 ring-gold-500/12 transition-colors hover:text-parchment">
        <SlidersHorizontal className="h-4 w-4" />
        Bộ lọc
      </button>
    </div>
  );
}
