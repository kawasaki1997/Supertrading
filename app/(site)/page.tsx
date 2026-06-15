import { Hero } from "@/components/sections/Hero";
import { StatsBar } from "@/components/sections/StatsBar";
import { ShopToolbar } from "@/components/sections/ShopToolbar";
import { ProductSection } from "@/components/sections/ProductSection";
import { Footer } from "@/components/layout/Footer";
import { getShopData } from "@/lib/queries";

// Always render with the latest database content (admin edits show immediately).
export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getShopData();
  const total = categories.reduce((sum, c) => sum + c.products.length, 0);
  const chips = categories.map((c) => ({ id: c.id, title: c.title, slug: c.slug }));

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Hero />
      <StatsBar />
      <ShopToolbar categories={chips} total={total} />

      <div className="space-y-12">
        {categories.map((c) => (
          <ProductSection key={c.id} category={c} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
