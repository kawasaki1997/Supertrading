// Nạp catalog từ catalog-export.json vào database hiện tại (Postgres/Supabase).
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();
const cats = JSON.parse(readFileSync("prisma/catalog-export.json", "utf8"));

// xóa sạch catalog cũ (nếu có) rồi nạp lại
await prisma.stockItem.deleteMany();
await prisma.product.deleteMany();
await prisma.category.deleteMany();

for (const c of cats) {
  await prisma.category.create({
    data: {
      title: c.title,
      subtitle: c.subtitle,
      slug: c.slug,
      order: c.order,
      products: {
        create: c.products.map((p) => ({
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice,
          stock: p.stock,
          sold: p.sold,
          badge: p.badge,
          image: p.image,
          order: p.order,
          active: p.active,
          ...(p.stockItems?.length
            ? { stockItems: { create: p.stockItems.map((s) => ({ content: s.content })) } }
            : {}),
        })),
      },
    },
  });
}

const n = await prisma.product.count();
console.log(`Imported ${cats.length} categories, ${n} products.`);
await prisma.$disconnect();
