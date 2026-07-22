// Test LTC auto-credit logic
const LTC_ADDR = "LS8NBk3jHW312NRYwKQePeUoDX2pHiYVZA";
const LTC_USD_RATE = 80;

async function testLtcIncoming() {
  console.log("=== Test fetchLtcIncoming ===");
  console.log("Address:", LTC_ADDR);

  const url = `https://api.blockcypher.com/v1/ltc/main/addrs/${LTC_ADDR}?limit=50`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("\nTotal txs:", data.txrefs?.length || 0);

  // Lọc incoming (tx_input_n === -1)
  const incoming = (data.txrefs || [])
    .filter(r => r.tx_input_n === -1)
    .map(r => ({
      hash: r.tx_hash,
      value_litoshi: r.value,
      value_ltc: r.value / 1e8,
      confirmed: r.confirmed,
    }));

  console.log("\nIncoming txs:", incoming.length);
  incoming.forEach(tx => {
    console.log(`  ${tx.hash.slice(0, 12)}... = ${tx.value_ltc.toFixed(8)} LTC (~$${(tx.value_ltc * LTC_USD_RATE).toFixed(2)})`);
  });

  // Giả sử lệnh NAP4816C9A3 yêu cầu nạp $5 → cần gửi 5/80 = 0.0625 LTC
  const orderAmount = 5; // USD
  const requiredLtc = orderAmount / LTC_USD_RATE;
  console.log(`\nVí dụ: lệnh nạp $${orderAmount} → cần ${requiredLtc.toFixed(8)} LTC`);

  const tolerance = 0.0000005;
  const matched = incoming.find(tx => Math.abs(tx.value_ltc - requiredLtc) <= tolerance);
  console.log("Có tx khớp:", matched ? `✓ ${matched.hash.slice(0, 12)}...` : "✗ không có");
}

testLtcIncoming().catch(console.error);
