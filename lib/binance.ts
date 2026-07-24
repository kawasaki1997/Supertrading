/**
 * Lấy tỉ giá crypto từ Binance API
 */

interface BinanceTickerResponse {
  symbol: string;
  price: string;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 phút

interface CacheEntry {
  price: number;
  timestamp: number;
}

const priceCache = new Map<string, CacheEntry>();

/**
 * Lấy giá USD của 1 đơn vị crypto từ Binance
 * @param symbol - Trading pair trên Binance, ví dụ: "LTCUSDT", "BTCUSDT"
 * @returns Giá USD, hoặc null nếu lỗi
 */
export async function getBinancePrice(symbol: string): Promise<number | null> {
  try {
    // Kiểm tra cache
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.price;
    }

    // Gọi Binance API
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`Binance API error: HTTP ${res.status}`);
      return null;
    }

    const data = (await res.json()) as BinanceTickerResponse;
    const price = parseFloat(data.price);

    if (isNaN(price)) {
      console.error(`Invalid price from Binance: ${data.price}`);
      return null;
    }

    // Lưu cache
    priceCache.set(symbol, { price, timestamp: Date.now() });

    return price;
  } catch (err) {
    console.error(`Failed to fetch Binance price for ${symbol}:`, err);
    return null;
  }
}

/**
 * Lấy tỉ giá LTC/USD từ Binance
 */
export async function getLtcUsdRate(): Promise<number> {
  const price = await getBinancePrice("LTCUSDT");

  // Fallback về giá trong .env nếu API lỗi
  if (price === null) {
    const fallback = Number(process.env.LTC_USD_RATE || 80);
    console.warn(`Binance API failed, using fallback rate: $${fallback}/LTC`);
    return fallback;
  }

  return price;
}
