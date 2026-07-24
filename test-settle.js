const { PrismaClient } = require('@prisma/client');
const { settleDepositOrder } = require('./lib/deposit-actions');
const prisma = new PrismaClient();

async function main() {
  // Test với lệnh $14.99
  const order = await prisma.depositOrder.findUnique({
    where: { code: 'NAP185A8140' },
  });

  if (!order) {
    console.log('Không tìm thấy lệnh!');
    return;
  }

  console.log('Trước khi settle:');
  console.log(`  Code: ${order.code}`);
  console.log(`  Amount: $${order.amountUsd} = ${order.cryptoAmount} LTC`);
  console.log(`  Status: ${order.status}`);
  console.log(`  TxHash: ${order.txHash || 'null'}\n`);

  console.log('Đang chạy settle...\n');

  const result = await settleDepositOrder(order);

  console.log('Kết quả:', result);

  const updated = await prisma.depositOrder.findUnique({
    where: { code: 'NAP185A8140' },
  });

  console.log('\nSau khi settle:');
  console.log(`  Status: ${updated.status}`);
  console.log(`  TxHash: ${updated.txHash || 'null'}`);
  console.log(`  ConfirmedAt: ${updated.confirmedAt || 'null'}`);

  await prisma.$disconnect();
}

main().catch(console.error);
