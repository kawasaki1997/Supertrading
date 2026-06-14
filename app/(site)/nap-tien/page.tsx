import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, Info, History } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DEPOSIT_METHODS, statusLabel } from "@/lib/deposit-config";
import { DepositForm } from "@/components/deposit/DepositForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nạp tiền — Super Trading" };

export default async function DepositPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: me.id } }),
    prisma.depositOrder.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);
  if (!user) redirect("/dang-nhap");

  const methods = Object.values(DEPOSIT_METHODS).map((m) => ({
    key: m.key,
    label: m.label,
    network: m.network,
    symbol: m.symbol,
    usdPerUnit: m.usdPerUnit,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-gold-400" />
        <h1 className="font-display text-2xl font-bold tracking-wide text-parchment">Nạp tiền</h1>
      </div>

      {/* Balance */}
      <div className="rounded-2xl glass p-5">
        <p className="text-xs uppercase tracking-wider text-muted">Số dư hiện tại</p>
        <p className="mt-1 font-display text-4xl font-bold text-gold-grad">
          ${user.balance.toFixed(2)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="rounded-2xl glass p-6 lg:col-span-3">
          <DepositForm methods={methods} />
        </div>

        {/* Instructions */}
        <div className="space-y-3 rounded-2xl glass p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-gold-300">
            <Info className="h-5 w-5" /> Hướng dẫn nạp tiền
          </h2>
          <ol className="space-y-2.5 text-sm text-parchment-dim">
            <li>1. Chọn loại tiền (USDT BEP-20 hoặc Litecoin) và số tiền muốn nạp.</li>
            <li>2. Bấm <b className="text-parchment">Tạo lệnh nạp</b> để lấy địa chỉ ví & mã đơn.</li>
            <li>3. Chuyển <b className="text-parchment">đúng số lượng</b> crypto tới địa chỉ hiển thị.</li>
            <li>4. Ghi <b className="text-parchment">mã đơn / username</b> vào ghi chú (memo) nếu có.</li>
            <li>5. Sau khi admin xác nhận nhận được tiền, số dư sẽ được cộng tự động.</li>
          </ol>
          <div className="rounded-xl bg-gold-500/8 p-3 text-xs ring-1 ring-gold-500/20">
            <p className="font-semibold text-gold-300">Lưu ý quan trọng</p>
            <p className="mt-1 text-parchment-dim">
              Gửi đúng mạng lưới (BEP-20 cho USDT). Gửi sai mạng có thể mất tiền vĩnh viễn.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl glass p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <History className="h-5 w-5 text-gold-400" /> Lịch sử nạp tiền
        </h2>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Chưa có lệnh nạp nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-500/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="py-2 pr-3 font-semibold">Mã đơn</th>
                  <th className="py-2 pr-3 font-semibold">Loại</th>
                  <th className="py-2 pr-3 font-semibold">Số tiền</th>
                  <th className="py-2 pr-3 font-semibold">Trạng thái</th>
                  <th className="py-2 pr-3 font-semibold">Thời gian</th>
                  <th className="py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/8">
                {orders.map((o) => {
                  const s = statusLabel(o.status);
                  return (
                    <tr key={o.id} className="text-parchment-dim">
                      <td className="py-3 pr-3 font-mono text-xs text-parchment">{o.code}</td>
                      <td className="py-3 pr-3">{o.symbol} ({o.network})</td>
                      <td className="py-3 pr-3 font-semibold text-gold-300">${o.amountUsd.toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${s.cls}`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs">
                        {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(o.createdAt)}
                      </td>
                      <td className="py-3">
                        {o.status === "PENDING" && (
                          <Link href={`/nap-tien/${o.code}`} className="text-xs font-semibold text-gold-400 hover:text-gold-300">
                            Xem
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
