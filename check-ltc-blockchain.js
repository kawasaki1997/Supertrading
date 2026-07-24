const address = 'LS8NBk3jHW312NRYwKQePeUoDX2pHiYVZA';
const url = `https://api.blockcypher.com/v1/ltc/main/addrs/${address}/full?limit=50`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(`Address: ${address}`);
    console.log(`Balance: ${data.balance / 1e8} LTC`);
    console.log(`Total received: ${data.total_received / 1e8} LTC`);
    console.log(`Total sent: ${data.total_sent / 1e8} LTC`);
    console.log(`Transactions: ${data.n_tx}\n`);

    if (!data.txs || data.txs.length === 0) {
      console.log('Không có giao dịch nào!');
      return;
    }

    console.log('10 giao dịch gần nhất:\n');
    data.txs.slice(0, 10).forEach(tx => {
      const confirmations = tx.confirmations || 0;
      const time = tx.received ? new Date(tx.received).toLocaleString() : 'pending';

      // Tìm output gửi tới địa chỉ này
      const output = tx.outputs.find(o => o.addresses && o.addresses.includes(address));
      const amount = output ? output.value / 1e8 : 0;

      console.log(`${tx.hash.slice(0, 16)}...`);
      console.log(`  Amount: ${amount} LTC`);
      console.log(`  Time: ${time}`);
      console.log(`  Confirmations: ${confirmations}`);
      console.log('');
    });
  })
  .catch(err => console.error('Lỗi:', err.message));
