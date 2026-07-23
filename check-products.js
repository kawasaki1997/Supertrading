const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, deliveryType: true },
    take: 10
  });
  console.log('Products in database:');
  products.forEach(p => console.log(`  ${p.id} | ${p.name} | ${p.deliveryType}`));

  await prisma.$disconnect();
}

main().catch(console.error);
