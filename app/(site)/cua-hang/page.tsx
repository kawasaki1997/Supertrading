import { SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { ProductCard } from "@/components/sections/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cửa hàng — Super Trading" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; stock?: string }>;
}) {
  const { category, sort, stock } = await searchParams;
  const t = await getT();

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : sort === "newest"
          ? { createdAt: "desc" as const }
          : { sold: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(stock === "1" ? { stock: { gt: 0 } } : {}),
    },
    orderBy,
    take: 120,
  });

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    stock: p.stock,
    sold: p.sold,
    badge: p.badge,
    image: p.image,
  }));

  const selectCls =
    "h-10 rounded-lg border border-gold-500/15 bg-ink-800/70 px-3 text-sm text-parchment outline-none focus:border-gold-500/40";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-wide text-parchment">
        {category
          ? (categories.find((c) => c.slug === category)?.title ?? t("shop.allProducts"))
          : t("shop.allProducts")}
      </h1>

      {/* Filter bar */}
      <form action="/cua-hang" className="flex flex-wrap items-end gap-3 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gold-300">
          <SlidersHorizontal className="h-4 w-4" /> {t("shop.filterTitle")}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">{t("shop.category")}</span>
          <select name="category" defaultValue={category ?? ""} className={selectCls}>
            <option value="" className="bg-ink-800">{t("shop.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug} className="bg-ink-800">
                {c.title.split(" — ")[0]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">{t("shop.sortBy")}</span>
          <select name="sort" defaultValue={sort ?? "popular"} className={selectCls}>
            <option value="popular" className="bg-ink-800">{t("shop.sortPopular")}</option>
            <option value="price-asc" className="bg-ink-800">{t("shop.sortPriceLow")}</option>
            <option value="price-desc" className="bg-ink-800">{t("shop.sortPriceHigh")}</option>
            <option value="newest" className="bg-ink-800">{t("shop.sortNewest")}</option>
          </select>
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 self-end text-sm text-parchment-dim">
          <input type="checkbox" name="stock" value="1" defaultChecked={stock === "1"} className="h-4 w-4 accent-gold-500" />
          {t("shop.inStockOnly")}
        </label>
        <button className="h-10 cursor-pointer self-end rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500">
          {t("shop.apply")}
        </button>
      </form>

      <p className="text-sm text-muted">{items.length} {t("search.count")}</p>

      {items.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">{t("search.noResults")}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
