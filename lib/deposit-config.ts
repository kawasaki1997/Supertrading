// Cấu hình nạp tiền. Địa chỉ ví & tỷ giá lấy từ .env (sửa ở đó).
export type DepositMethodKey = "USDT_BEP20" | "LTC" | "BANK" | "MOMO";

export type DepositMethod = {
  key: DepositMethodKey;
  label: string; // hiển thị nhóm: USDT / Litecoin
  network: string; // BEP-20 / LTC
  symbol: string; // USDT / LTC
  address: string; // địa chỉ ví nhận
  usdPerUnit: number; // 1 đơn vị crypto = ? USD
  note: string;
};

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
    label: "Chuyển khoản ngân hàng",
    network: "VietQR",
    symbol: "VND",
    address: "", // không dùng địa chỉ crypto
    usdPerUnit: 0.00004, // 1 USD = 25,000 VND
    note: "Chuyển khoản qua VietQR với nội dung chính xác để tự động cộng tiền.",
  },
  MOMO: {
    key: "MOMO",
    label: "Ví MoMo",
    network: "MoMo",
    symbol: "VND",
    address: "",
    usdPerUnit: 0.00004, // 1 USD = 25,000 VND
    note: "Thanh toán qua ví MoMo, tự động cộng tiền sau khi thanh toán thành công.",
  },
};

export const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export function isValidMethod(k: string): k is DepositMethodKey {
  return k === "USDT_BEP20" || k === "LTC" || k === "BANK" || k === "MOMO";
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
