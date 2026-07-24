"use client";

import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
} from "lucide-react";

type Deposit = {
  id: string;
  code: string;
  userName: string;
  userEmail: string;
  method: string;
  symbol: string;
  amountUsd: number;
  cryptoAmount: number;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
};

type Order = {
  id: string;
  code: string;
  userName: string;
  userEmail: string;
  productName: string;
  qty: number;
  total: number;
  status: string;
  deliveryType: string;
  createdAt: string;
};

type Stats = {
  totalDeposits: number;
  totalDepositAmount: number;
  pendingDeposits: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
};

export function AnalyticsDashboard({
  deposits,
  orders,
  stats,
}: {
  deposits: Deposit[];
  orders: Order[];
  stats: Stats;
}) {
  const [tab, setTab] = useState<"deposits" | "orders">("deposits");
  const [search, setSearch] = useState("");

  const filteredDeposits = deposits.filter(
    (d) =>
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.userName.toLowerCase().includes(search.toLowerCase()) ||
      d.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gold-grad">
          Thống kê & Lịch sử giao dịch
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tổng quan doanh thu và hoạt động người dùng
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl glass p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Tổng nạp tiền</p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-soft">
                ${stats.totalDepositAmount.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {stats.totalDeposits} lệnh · {stats.pendingDeposits} chờ duyệt
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-soft/10">
              <CreditCard className="h-6 w-6 text-emerald-soft" />
            </div>
          </div>
        </div>

        <div className="rounded-xl glass p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Doanh thu</p>
              <p className="mt-1 font-display text-2xl font-bold text-gold-300">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted">{stats.totalOrders} đơn hàng</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-gold-500/10">
              <TrendingUp className="h-6 w-6 text-gold-300" />
            </div>
          </div>
        </div>

        <div className="rounded-xl glass p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Người dùng</p>
              <p className="mt-1 font-display text-2xl font-bold text-blue-400">
                {stats.totalUsers}
              </p>
              <p className="mt-1 text-xs text-muted">Tài khoản đã đăng ký</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("deposits")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "deposits"
              ? "bg-gold-500/20 text-gold-300"
              : "text-muted hover:bg-ink-800/50 hover:text-parchment-dim"
          }`}
        >
          Lịch sử nạp tiền ({deposits.length})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "orders"
              ? "bg-gold-500/20 text-gold-300"
              : "text-muted hover:bg-ink-800/50 hover:text-parchment-dim"
          }`}
        >
          Lịch sử mua hàng ({orders.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "deposits"
              ? "Tìm theo mã lệnh, tên, email..."
              : "Tìm theo mã đơn, tên, sản phẩm..."
          }
          className="h-10 w-full rounded-lg border border-gold-500/15 bg-ink-800/70 pl-10 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
        />
      </div>

      {/* Deposits table */}
      {tab === "deposits" && (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/10 bg-ink-800/40 text-left text-xs font-semibold text-parchment-dim">
                  <th className="px-4 py-3">Mã lệnh</th>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Phương thức</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/8">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                      Không tìm thấy lệnh nạp tiền nào
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((d) => (
                    <tr key={d.id} className="hover:bg-ink-800/30">
                      <td className="px-4 py-3">
                        <code className="text-xs font-semibold text-parchment">{d.code}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-parchment">{d.userName}</p>
                          <p className="text-xs text-muted">{d.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-parchment-dim">{d.method}</p>
                          <p className="text-xs text-muted">{d.symbol}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-emerald-soft">
                            ${d.amountUsd.toFixed(2)}
                          </p>
                          {d.method !== "BANK" && (
                            <p className="text-xs text-muted">
                              {d.cryptoAmount} {d.symbol}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-soft">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hoàn tất
                          </span>
                        ) : d.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-soft">
                            <XCircle className="h-3.5 w-3.5" />
                            Từ chối
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(d.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders table */}
      {tab === "orders" && (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/10 bg-ink-800/40 text-left text-xs font-semibold text-parchment-dim">
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người mua</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/8">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-ink-800/30">
                      <td className="px-4 py-3">
                        <code className="text-xs font-semibold text-parchment">{o.code}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-parchment">{o.userName}</p>
                          <p className="text-xs text-muted">{o.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-xs truncate text-sm text-parchment-dim">
                          {o.productName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-parchment">{o.qty}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gold-300">
                          ${o.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            o.deliveryType === "AUTO"
                              ? "bg-emerald-soft/20 text-emerald-soft"
                              : "bg-royal-500/20 text-royal-300"
                          }`}
                        >
                          {o.deliveryType === "AUTO" ? "Tự động" : "Giao tay"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {o.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-soft">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hoàn tất
                          </span>
                        ) : o.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            Chờ giao
                          </span>
                        ) : o.status === "DELIVERED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã giao
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-soft">
                            <XCircle className="h-3.5 w-3.5" />
                            Đã hủy
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
