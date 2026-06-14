import { ChevronRight } from "lucide-react";
import type { UICategory } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductSection({ category }: { category: UICategory }) {
  return (
    <section id={category.slug} className="scroll-mt-28">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-gold-300 to-royal-500" />
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-parchment sm:text-2xl">
              {category.title}
            </h2>
            <p className="mt-0.5 font-serif text-sm text-parchment-dim">
              {category.subtitle}
            </p>
          </div>
        </div>
        <button className="hidden shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300 sm:inline-flex">
          Xem tất cả
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid */}
      {category.products.length === 0 ? (
        <p className="rounded-2xl glass px-4 py-8 text-center text-sm text-muted">
          Chưa có sản phẩm trong danh mục này.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {category.products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
