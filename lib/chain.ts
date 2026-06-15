/**
 * Đọc giao dịch ĐẾN (incoming) của 1 địa chỉ ví từ blockchain explorer.
 * Dùng để tự động khớp & cộng tiền cho lệnh nạp crypto.
 *
 * - USDT BEP-20: Etherscan V2 API (chainid 56 = BSC). Cần BSCSCAN_API_KEY.
 * - LTC: BlockCypher (không cần key, có giới hạn tốc độ).
 */

export type IncomingTx = {
  hash: string;
  amount: number; // số lượng crypto (đơn vị chuẩn, vd USDT hoặc LTC)
  ts: number; // unix seconds
};

// Hợp đồng USDT trên Binance Smart Chain (BEP-20), 18 decimals.
const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Giao dịch USDT (BEP-20) đến địa chỉ — qua Etherscan V2 (chainid 56). */
export async function fetchUsdtBep20Incoming(address: string): Promise<IncomingTx[]> {
  const key = process.env.BSCSCAN_API_KEY;
  if (!key) throw new Error("BSCSCAN_API_KEY chưa cấu hình");
  const addr = address.toLowerCase();
  const url =
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx` +
    `&contractaddress=${USDT_BSC_CONTRACT}&address=${addr}` +
    `&page=1&offset=50&sort=desc&apikey=${key}`;

  const data = (await getJson(url)) as { status: string; message: string; result: unknown };
  if (!Array.isArray(data.result)) {
    // status "0" + message "No transactions found" → mảng rỗng, không phải lỗi
    if (data.message && /no transactions/i.test(data.message)) return [];
    throw new Error(`BscScan: ${data.message || "phản hồi không hợp lệ"}`);
  }

  const rows = data.result as Array<{
    hash: string;
    to: string;
    value: string;
    tokenDecimal: string;
    timeStamp: string;
  }>;

  return rows
    .filter((r) => r.to?.toLowerCase() === addr)
    .map((r) => ({
      hash: r.hash,
      amount: Number(r.value) / 10 ** Number(r.tokenDecimal || "18"),
      ts: Number(r.timeStamp),
    }));
}

/** Giao dịch LTC đến địa chỉ — qua BlockCypher (keyless). */
export async function fetchLtcIncoming(address: string): Promise<IncomingTx[]> {
  const token = process.env.BLOCKCYPHER_TOKEN;
  const url =
    `https://api.blockcypher.com/v1/ltc/main/addrs/${address}` +
    `?limit=50${token ? `&token=${token}` : ""}`;

  const data = (await getJson(url)) as {
    txrefs?: Array<{ tx_hash: string; value: number; tx_input_n: number; confirmed?: string }>;
  };
  const refs = data.txrefs ?? [];

  return refs
    // tx_input_n === -1 nghĩa là địa chỉ NHẬN tiền ở giao dịch này
    .filter((r) => r.tx_input_n === -1)
    .map((r) => ({
      hash: r.tx_hash,
      amount: r.value / 1e8, // litoshis → LTC
      ts: r.confirmed ? Math.floor(new Date(r.confirmed).getTime() / 1000) : 0,
    }));
}

/** Lấy giao dịch đến theo phương thức nạp. */
export async function fetchIncoming(method: string, address: string): Promise<IncomingTx[]> {
  if (method === "LTC") return fetchLtcIncoming(address);
  return fetchUsdtBep20Incoming(address);
}
