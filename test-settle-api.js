// Test settle qua HTTP như cron thật
const code = 'NAP185A8140';
const url = `http://localhost:3000/api/settle-deposits`;

console.log(`Gọi ${url} để settle tất cả lệnh pending...\n`);

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
})
  .then(res => res.json())
  .then(result => {
    console.log('Kết quả settle:', result);
    console.log(`\nKiểm tra lệnh ${code}:`);

    return fetch(`http://localhost:3000/api/deposits/${code}`);
  })
  .then(res => res.json())
  .then(order => {
    console.log(`  Status: ${order.status}`);
    console.log(`  TxHash: ${order.txHash || 'null'}`);
  })
  .catch(err => console.error('Lỗi:', err.message));
