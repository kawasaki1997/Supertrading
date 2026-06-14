import { MessageCircle } from "lucide-react";
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

      {/* Floating chat */}
      <button
        aria-label="Mở chat hỗ trợ"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-[0_10px_40px_-8px_rgba(200,170,110,0.6)] transition-transform duration-200 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-rose-soft ring-2 ring-ink-950" />
      </button>
    </div>
  );
}
