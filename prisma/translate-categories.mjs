import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates = [
  { slug: "grow-a-garden-2", title: "Grow a Garden 2", subtitle: "Rare seeds, pets & items — delivered in minutes" },
  { slug: "blox-fruits", title: "Blox Fruits — Fruit Inventory", subtitle: "Rare devil-fruit stock, delivered in ~1 minute" },
  { slug: "robux", title: "Robux — Cheap & Safe", subtitle: "Official Robux top-up, 100% safe for your account" },
  { slug: "accounts", title: "Premium Accounts", subtitle: "Fully-loaded, max-level accounts with lifetime warranty" },
  { slug: "services", title: "Services — Raid & Carry", subtitle: "Professional boosting, completed on time" },
];

for (const u of updates) {
  const r = await prisma.category.updateMany({
    where: { slug: u.slug },
    data: { title: u.title, subtitle: u.subtitle },
  });
  console.log(`${u.slug}: ${r.count > 0 ? "updated" : "NOT FOUND"} -> ${u.title}`);
}
await prisma.$disconnect();
