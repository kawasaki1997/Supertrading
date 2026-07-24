const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const code = 'MNKRCE2MJA'; // lệnh LTC trong screenshot

  const deposit = await prisma.depositOrder.findUnique({
    where: { code },
  });

  if (!deposit) {
    console.log('Không tìm thấy lệnh nạp này!');
    return;
  }

  console.log('Lệnh nạp:');
  console.log(`  Code: ${deposit.code}`);
  console.log(`  Method: ${deposit.method}`);
  console.log(`  Amount: $${deposit.amountUsd}`);
  console.log(`  Crypto: ${deposit.cryptoAmount} ${deposit.method}`);
  console.log(`  Status: ${deposit.status}`);
  console.log(`  Address: ${deposit.cryptoAddress}`);
  console.log(`  TxHash: ${deposit.txHash || 'null'}`);
  console.log(`  Created: ${deposit.createdAt}`);
  console.log(`  Updated: ${deposit.updatedAt}`);

  await prisma.$disconnect();
}

main().catch(console.error);
