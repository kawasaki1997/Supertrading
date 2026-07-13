/**
 * Đọc giao dịch ĐẾN (incoming) của 1 địa chỉ ví từ blockchain.
 * Dùng để tự động khớp & cộng tiền cho lệnh nạp crypto.
 *
 * - USDT BEP-20: quét event Transfer qua RPC BSC công khai (bloXroute hỗ trợ eth_getLogs
 *   phạm vi rộng, miễn phí, không cần key). Nếu tất cả RPC lỗi → dự phòng API Etherscan V2
 *   (chỉ chạy khi có gói API hỗ trợ BSC).
 * - LTC: BlockCypher (không cần key, có giới hạn tốc độ; có thể đặt BLOCKCYPHER_TOKEN).
 */

export type IncomingTx = {
  hash: string;
  amount: number; // số lượng crypto (đơn vị chuẩn: USDT hoặc LTC)
  ts: number; // unix seconds (0 nếu không có — khi đó dựa vào khoảng block để giới hạn thời gian)
};

// USDT trên Binance Smart Chain (BEP-20), 18 decimals.
const USDT_BSC = "0x55d398326f99059ff775485246999027b3197955";
// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// bloXroute cho eth_getLogs phạm vi rộng (tới 40k block) MIỄN PHÍ, không cần key —
// đây là nguồn chính chạy được. Các node còn lại chỉ là dự phòng (đa số chặn getLogs).
const BSC_RPCS = [
  "https://bsc.rpc.blxrbdn.com",
  "https://bsc-dataseed.binance.org",
  "https://bsc.drpc.org",
];
// BSC block rất nhanh (~0.45s sau nâng cấp). Ước lượng THẤP để quét rộng hơn, không bỏ sót.
const BSC_BLOCK_MS = 250;
const MAX_SCAN_BLOCKS = 40000; // node công khai thường chỉ giữ ~ngần này block log (~5h)
const CHUNK = 5000; // giới hạn 1 lần eth_getLogs

/** Số nguyên chuỗi (đơn vị nhỏ nhất, `decimals` chữ số) → số thập phân. BigInt để không mất chính xác. */
function fromTokenUnits(raw: string, decimals: number): number {
  try {
    const value = BigInt(raw);
    // Giữ 6 chữ số thập phân là quá đủ để khớp (bước sinh số lẻ nhỏ nhất là 1e-6).
    const micro =
      decimals > 6
        ? value / BigInt(10) ** BigInt(decimals - 6)
        : value * BigInt(10) ** BigInt(6 - decimals);
    return Number(micro) / 1e6;
  } catch {
    return 0;
  }
}

/* ----------------------------- USDT (BEP-20) ----------------------------- */

async function rpc(url: string, method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

/** Nguồn chính: quét event Transfer USDT đến địa chỉ qua RPC BSC. */
async function fetchUsdtViaRpc(address: string, sinceMs: number): Promise<IncomingTx[]> {
  const addr = address.toLowerCase();
  const paddedTo = "0x" + addr.slice(2).padStart(64, "0");

  let lastErr: unknown;
  for (const url of BSC_RPCS) {
    try {
      const latest = Number(BigInt((await rpc(url, "eth_blockNumber", [])) as string));
      const blocksBack = Math.min(
        MAX_SCAN_BLOCKS,
        Math.ceil((Date.now() - sinceMs) / BSC_BLOCK_MS) + 1500, // đệm
      );
      const fromStart = Math.max(0, latest - blocksBack);

      const out: IncomingTx[] = [];
      for (let to = latest; to >= fromStart; to -= CHUNK) {
        const from = Math.max(fromStart, to - (CHUNK - 1));
        const logs = (await rpc(url, "eth_getLogs", [
          {
            address: USDT_BSC,
            topics: [TRANSFER_TOPIC, null, paddedTo],
            fromBlock: "0x" + from.toString(16),
            toBlock: "0x" + to.toString(16),
          },
        ])) as Array<{ transactionHash: string; data: string }>;
        for (const lg of logs) {
          out.push({ hash: lg.transactionHash, amount: fromTokenUnits(lg.data, 18), ts: 0 });
        }
        if (from === fromStart) break;
      }
      return out;
    } catch (e) {
      lastErr = e;
      console.error("[bsc rpc]", url, e instanceof Error ? e.message : e);
    }
  }
  throw new Error(`Tất cả BSC RPC đều lỗi: ${lastErr instanceof Error ? lastErr.message : lastErr}`);
}

/**
 * Dự phòng: API Etherscan V2 (chainid=56, action=tokentx). Chỉ chạy được khi có key + gói
 * hỗ trợ BSC (gói free hiện KHÔNG hỗ trợ BSC). Trả null nếu chưa cấu hình / API từ chối.
 */
async function fetchUsdtViaEtherscan(address: string): Promise<IncomingTx[] | null> {
  const apiKey = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY;
  if (!apiKey) return null;

  const url =
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx` +
    `&contractaddress=${USDT_BSC}&address=${address}` +
    `&page=1&offset=100&sort=desc&apikey=${apiKey}`;

  let data: {
    status?: string;
    message?: string;
    result?:
      | Array<{ hash: string; to: string; value: string; tokenDecimal: string; timeStamp: string; contractAddress: string }>
      | string;
  };
  try {
    const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error("[etherscan v2] fetch lỗi:", e instanceof Error ? e.message : e);
    return null;
  }

  if (!Array.isArray(data.result)) {
    // "No transactions found" là bình thường (chưa có tx) → coi như rỗng.
    if (data.status === "0" && /no transactions found/i.test(String(data.message ?? ""))) return [];
    console.error("[etherscan v2] phản hồi bất thường:", data.message, data.result);
    return null; // key sai / gói không hỗ trợ BSC / rate limit → coi như không có nguồn này
  }

  const addr = address.toLowerCase();
  return data.result
    .filter((r) => r.to?.toLowerCase() === addr && r.contractAddress?.toLowerCase() === USDT_BSC)
    .map((r) => ({
      hash: r.hash,
      amount: fromTokenUnits(r.value, Number(r.tokenDecimal) || 18),
      ts: Number(r.timeStamp) || 0,
    }));
}

/** Giao dịch USDT (BEP-20) đến địa chỉ: RPC trước (nguồn chạy được), Etherscan V2 dự phòng. */
export async function fetchUsdtBep20Incoming(address: string, sinceMs: number): Promise<IncomingTx[]> {
  try {
    return await fetchUsdtViaRpc(address, sinceMs);
  } catch (e) {
    console.error("[usdt] RPC thất bại, thử Etherscan V2:", e instanceof Error ? e.message : e);
    const viaApi = await fetchUsdtViaEtherscan(address);
    if (viaApi !== null) return viaApi;
    throw e; // không nguồn nào đọc được → để checkDeposit giữ trạng thái PENDING
  }
}

/* --------------------------------- LTC --------------------------------- */

/** Giao dịch LTC đến địa chỉ — qua BlockCypher (keyless). */
export async function fetchLtcIncoming(address: string): Promise<IncomingTx[]> {
  const token = process.env.BLOCKCYPHER_TOKEN;
  const url =
    `https://api.blockcypher.com/v1/ltc/main/addrs/${address}` +
    `?limit=50${token ? `&token=${token}` : ""}`;
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    txrefs?: Array<{ tx_hash: string; value: number; tx_input_n: number; confirmed?: string }>;
  };
  return (data.txrefs ?? [])
    .filter((r) => r.tx_input_n === -1) // địa chỉ NHẬN ở giao dịch này
    .map((r) => ({
      hash: r.tx_hash,
      amount: r.value / 1e8,
      ts: r.confirmed ? Math.floor(new Date(r.confirmed).getTime() / 1000) : 0,
    }));
}

/** Lấy giao dịch đến theo phương thức nạp. */
export async function fetchIncoming(
  method: string,
  address: string,
  sinceMs: number,
): Promise<IncomingTx[]> {
  if (method === "LTC") return fetchLtcIncoming(address);
  return fetchUsdtBep20Incoming(address, sinceMs);
}
