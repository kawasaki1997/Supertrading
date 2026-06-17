/**
 * Định dạng giá USD: tối thiểu 2, tối đa 5 chữ số thập phân (cắt số 0 thừa).
 * formatPrice(2) → "2.00" · formatPrice(0.5) → "0.50" · formatPrice(0.0001) → "0.0001"
 */
export function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  const s = n.toFixed(5).replace(/0+$/, "").replace(/\.$/, "");
  const [int, dec = ""] = s.split(".");
  if (dec.length < 2) return `${int}.${(dec + "00").slice(0, 2)}`;
  return `${int}.${dec}`;
}
