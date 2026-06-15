// Cấu hình nạp tiền. Địa chỉ ví / tài khoản & tỷ giá lấy từ .env (sửa ở đó).
export type DepositMethodKey = "USDT_BEP20" | "LTC" | "BANK";

export type DepositMethod = {
  key: DepositMethodKey;
  label: string; // hiển thị nhóm: USDT / Litecoin / Ngân hàng
  network: string; // BEP-20 / LTC / VietQR
  symbol: string; // USDT / LTC / VND
  address: string; // địa chỉ ví / số tài khoản nhận
  usdPerUnit: number; // 1 đơn vị (crypto/VND) = ? USD
  note: string;
  bankBin?: string; // mã BIN ngân hàng (cho VietQR)
  accountName?: string; // chủ tài khoản (cho VietQR)
};

export const VND_USD_RATE = Number(process.env.VND_USD_RATE || 25000);

export const DEPOSIT_METHODS: Record<DepositMethodKey, DepositMethod> = {
  USDT_BEP20: {
    key: "USDT_BEP20",
    label: "USDT",
    network: "BEP-20",
    symbol: "USDT",
    address: process.env.DEPOSIT_USDT_BEP20 || "0x_CHUA_CAU_HINH_DIA_CHI",
    usdPerUnit: 1,
    note: "Gửi USDT qua mạng BEP-20 (Binance Smart Chain). Chỉ gửi đúng mạng BEP-20.",
  },
  LTC: {
    key: "LTC",
    label: "Litecoin",
    network: "LTC",
    symbol: "LTC",
    address: process.env.DEPOSIT_LTC || "L_CHUA_CAU_HINH_DIA_CHI",
    usdPerUnit: Number(process.env.LTC_USD_RATE || 80),
    note: "Gửi LTC qua mạng Litecoin tới đúng địa chỉ ví bên dưới.",
  },
  BANK: {
    key: "BANK",
    label: "Ngân hàng",
    network: "VietQR",
    symbol: "VND",
    // Thông tin công khai (hiện cho khách) → để mặc định ngay đây, env ghi đè nếu cần.
    address: process.env.BANK_ACCOUNT || "106870949107",
    usdPerUnit: 1 / VND_USD_RATE, // 1 VND = ? USD
    note: "Chuyển khoản ngân hàng (quét VietQR). Nhập đúng nội dung CK để hệ thống tự cộng tiền.",
    bankBin: process.env.BANK_BIN || "970415", // VietinBank
    accountName: process.env.BANK_ACCOUNT_NAME || "NGUYEN VAN NHAT",
  },
};

export const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export function isValidMethod(k: string): k is DepositMethodKey {
  return k === "USDT_BEP20" || k === "LTC" || k === "BANK";
}

const BANK_NAMES: Record<string, string> = {
  "970407": "Techcombank",
  "970418": "BIDV",
  "970436": "Vietcombank",
  "970415": "VietinBank",
  "970422": "MB Bank",
  "970405": "Agribank",
  "970416": "ACB",
  "970432": "VPBank",
  "970423": "TPBank",
  "970403": "Sacombank",
  "970448": "OCB",
  "970426": "MSB",
};

export function bankLabel(bin?: string): string {
  return (bin && BANK_NAMES[bin]) || "Ngân hàng";
}

/** Link ảnh VietQR (miễn phí) cho 1 lệnh nạp ngân hàng. */
export function vietQrUrl(opts: {
  bankBin: string;
  account: string;
  accountName?: string;
  amount: number; // VND
  content: string; // nội dung CK (mã độc nhất)
}): string {
  const base = `https://img.vietqr.io/image/${opts.bankBin}-${opts.account}-compact2.png`;
  const params = new URLSearchParams({
    amount: String(Math.round(opts.amount)),
    addInfo: opts.content,
  });
  if (opts.accountName) params.set("accountName", opts.accountName);
  return `${base}?${params.toString()}`;
}

export function statusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return { text: "Đã cộng tiền", cls: "text-emerald-soft ring-emerald-soft/30 bg-emerald-soft/10" };
    case "REJECTED":
      return { text: "Bị từ chối", cls: "text-rose-soft ring-rose-soft/30 bg-rose-soft/10" };
    default:
      return { text: "Chờ thanh toán", cls: "text-gold-300 ring-gold-500/30 bg-gold-500/10" };
  }
}
