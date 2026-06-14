// Tạo Storage bucket "uploads" (public) trực tiếp trong Postgres của Supabase.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(
    `insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
     on conflict (id) do update set public = true;`,
  );
  const rows = await prisma.$queryRawUnsafe(
    `select id, public from storage.buckets where id = 'uploads';`,
  );
  console.log("BUCKET OK:", JSON.stringify(rows));
} catch (e) {
  console.error("BUCKET ERR:", e.message);
}
await prisma.$disconnect();
