import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { ProductCard } from "@/components/sections/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search — Super Trading" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const t = await getT();
  const query = (q ?? "").trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          active: true,
          name: { contains: query, mode: "insensitive" },
        },
        orderBy: { sold: "desc" },
        take: 60,
      })
    : [];

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-6 w-6 text-gold-400" />
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment">
          {t("search.title")}
        </h1>
      </div>

      {query && (
        <p className="text-sm text-muted">
          {items.length} {t("search.count")} · {t("search.resultsFor")}{" "}
          <span className="font-semibold text-parchment">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {!query ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">
          {t("search.prompt")}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted">
          {t("search.noResults")}
        </div>
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
