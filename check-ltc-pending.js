const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ltcDeposits = await prisma.depositOrder.findMany({
    where: {
      method: 'LTC',
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Tìm thấy ${ltcDeposits.length} lệnh LTC đang chờ:\n`);

  ltcDeposits.forEach(d => {
    console.log(`Code: ${d.code}`);
    console.log(`  Amount: $${d.amountUsd} = ${d.cryptoAmount} LTC`);
    console.log(`  Address: ${d.address}`);
    console.log(`  TxHash: ${d.txHash || 'null'}`);
    console.log(`  Created: ${d.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
