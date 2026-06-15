import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { UICategory } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { getT } from "@/lib/i18n";

const HOME_LIMIT = 6;

export async function ProductSection({ category }: { category: UICategory }) {
  const t = await getT();
  const shown = category.products.slice(0, HOME_LIMIT);
  const hasMore = category.products.length > HOME_LIMIT;

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
        {hasMore && (
          <Link
            href={`/cua-hang?category=${category.slug}`}
            className="hidden shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300 sm:inline-flex"
          >
            {t("common.viewAll")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <p className="rounded-2xl glass px-4 py-8 text-center text-sm text-muted">
          {t("shop.noProducts")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          {hasMore && (
            <Link
              href={`/cua-hang?category=${category.slug}`}
              className="mt-4 flex items-center justify-center gap-1 rounded-xl glass py-3 text-sm font-semibold text-gold-400 ring-gold transition-colors hover:text-gold-300 sm:hidden"
            >
              {t("common.viewAll")} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </>
      )}
    </section>
  );
}
