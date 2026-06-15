import { prisma } from "./db";
import type { UICategory } from "./types";

/** Categories + their active products, ready to hand to (client) UI components. */
export async function getShopData(): Promise<UICategory[]> {
  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: { where: { active: true }, orderBy: { order: "asc" } },
    },
  });

  return cats.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    slug: c.slug,
    products: c.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: p.stock,
      sold: p.sold,
      badge: p.badge,
      image: p.image,
      deliveryType: p.deliveryType,
    })),
  }));
}
