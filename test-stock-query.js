const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productId = 'cmqdfj26f0002u2t4mvxnhmxh'; // Raccoon

  console.log(`Querying product: ${productId}`);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      stockItems: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    console.log('Product not found!');
  } else {
    console.log(`Found: ${product.name}`);
    console.log(`Stock items: ${product.stockItems.length}`);
    console.log('Sample items:');
    product.stockItems.slice(0, 3).forEach(item => {
      console.log(`  - ${item.status} | ${item.content.slice(0, 30)} | orderId: ${item.orderId || 'null'}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
