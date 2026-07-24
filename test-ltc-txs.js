// Test getLtcTxs trực tiếp
const LTC_ADDRESS = 'LS8NBk3jHW312NRYwKQePeUoDX2pHiYVZA';

async function getLtcTxs() {
  const url = `https://api.blockcypher.com/v1/ltc/main/addrs/${LTC_ADDRESS}/full?limit=50`;
  const res = await fetch(url);
  const data = await res.json();

  console.log('BlockCypher response:', JSON.stringify(data, null, 2).slice(0, 2000));
  console.log('\n=== Parsed transactions ===');

  if (!data.txs) {
    console.log('Không có giao dịch!');
    return [];
  }

  const txs = data.txs
    .filter(tx => tx.confirmations > 0)
    .map(tx => {
      const out = tx.outputs.find(o => o.addresses?.[0] === LTC_ADDRESS);
      return {
        hash: tx.hash,
        amount: out ? out.value / 1e8 : 0,
        confirmations: tx.confirmations,
        time: tx.confirmed,
      };
    })
    .filter(tx => tx.amount > 0);

  console.log(`\nTìm thấy ${txs.length} giao dịch nhận tiền:`);
  txs.forEach(tx => {
    console.log(`  ${tx.amount} LTC | ${tx.confirmations} conf | ${tx.hash.slice(0, 12)}...`);
  });

  return txs;
}

getLtcTxs().catch(console.error);
