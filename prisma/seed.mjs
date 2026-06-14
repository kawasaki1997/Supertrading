import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  {
    title: "Blox Fruits — Fruit Inventory",
    subtitle: "Kho trái ác quỷ hiếm, giao ngay trong 1 phút",
    slug: "blox-fruits",
    products: [
      { name: "God Human", price: 0.25, oldPrice: 0.5, stock: 66, sold: 565, badge: "HOT" },
      { name: "Gas Inventory", price: 0.38, stock: 40, sold: 215 },
      { name: "Spirit — Mythic Fruit", price: 0.31, stock: 36, sold: 209, badge: "NEW" },
      { name: "Dough Inventory", price: 0.46, stock: 296, sold: 87 },
      { name: "Kitsune Inventory", price: 2.12, oldPrice: 3.0, stock: 12, sold: 33, badge: "LIMITED" },
      { name: "T-Rex Inventory", price: 0.46, stock: 0, sold: 2 },
    ],
  },
  {
    title: "Robux — Cheap & Safe",
    subtitle: "Nạp Robux chính ngạch, an toàn tuyệt đối cho tài khoản",
    slug: "robux",
    products: [
      { name: "400 Robux", price: 3.49, stock: 999, sold: 1820, badge: "HOT" },
      { name: "800 Robux", price: 6.79, oldPrice: 7.99, stock: 999, sold: 940, badge: "-50%" },
      { name: "1,700 Robux", price: 13.5, stock: 540, sold: 612 },
      { name: "4,500 Robux", price: 34.9, stock: 210, sold: 188, badge: "NEW" },
    ],
  },
  {
    title: "Tài khoản — Premium Accounts",
    subtitle: "Account full vật phẩm, max level, bảo hành trọn đời",
    slug: "accounts",
    products: [
      { name: "Blox Fruits — Max Level", price: 12.0, oldPrice: 18.0, stock: 8, sold: 142, badge: "HOT" },
      { name: "MM2 — Godly Set", price: 24.5, stock: 5, sold: 76, badge: "LIMITED" },
      { name: "Pet Sim — Huge Collection", price: 31.0, stock: 3, sold: 41 },
      { name: "Adopt Me — Mega Neon", price: 9.9, stock: 0, sold: 220 },
    ],
  },
  {
    title: "Dịch vụ — Raid & Carry",
    subtitle: "Cày thuê chuyên nghiệp, hoàn thành đúng hẹn",
    slug: "services",
    products: [
      { name: "Raid Service x10", price: 4.5, stock: 50, sold: 310, badge: "HOT" },
      { name: "Boss Carry Run", price: 2.0, stock: 120, sold: 540 },
      { name: "Level Boost 1→Max", price: 8.0, oldPrice: 11.0, stock: 30, sold: 96, badge: "-50%" },
    ],
  },
];

async function main() {
  // Idempotent: clear then reseed
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (let c = 0; c < data.length; c++) {
    const cat = data[c];
    await prisma.category.create({
      data: {
        title: cat.title,
        subtitle: cat.subtitle,
        slug: cat.slug,
        order: c,
        products: {
          create: cat.products.map((p, i) => ({
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice ?? null,
            stock: p.stock,
            sold: p.sold,
            badge: p.badge ?? null,
            order: i,
          })),
        },
      },
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded ${data.length} categories, ${count} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
