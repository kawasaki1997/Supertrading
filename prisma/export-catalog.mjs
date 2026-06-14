// Xuất catalog (category + product + stock khả dụng) từ SQLite ra JSON
// để nạp lại vào Postgres (Supabase) sau khi migrate.
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

const cats = await prisma.category.findMany({
  orderBy: { order: "asc" },
  include: {
    products: {
      orderBy: { order: "asc" },
      include: {
        stockItems: { where: { status: "AVAILABLE" }, select: { content: true } },
      },
    },
  },
});

writeFileSync("prisma/catalog-export.json", JSON.stringify(cats, null, 2));
console.log(
  `Exported ${cats.length} categories, ` +
    `${cats.reduce((s, c) => s + c.products.length, 0)} products.`,
);
await prisma.$disconnect();
