import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Super Trading" };

export default async function AdminPage() {
  const [categories, stockCounts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { products: { orderBy: { order: "asc" } } },
    }),
    prisma.stockItem.groupBy({
      by: ["productId"],
      where: { status: "AVAILABLE" },
      _count: { _all: true },
    }),
  ]);

  const stockMap = new Map(stockCounts.map((s) => [s.productId, s._count._all]));

  const data = categories.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    slug: c.slug,
    order: c.order,
    products: c.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: p.stock,
      sold: p.sold,
      badge: p.badge,
      image: p.image,
      order: p.order,
      active: p.active,
      categoryId: p.categoryId,
      available: stockMap.get(p.id) ?? 0,
    })),
  }));

  return <AdminDashboard categories={data} />;
}
