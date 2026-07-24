"use client";

import { useState } from "react";
import { Users, Search, Calendar, Wallet, ShoppingBag, CreditCard } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  totalDeposits: number;
  totalOrders: number;
  createdAt: string;
};

export function UsersManager({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gold-grad">
          Quản lý tài khoản
        </h1>
        <p className="mt-1 text-sm text-muted">
          {totalUsers} tài khoản · Tổng số dư: ${totalBalance.toFixed(2)}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="h-10 w-full rounded-lg border border-gold-500/15 bg-ink-800/70 pl-10 pr-4 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
        />
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-500/10 bg-ink-800/40 text-left text-xs font-semibold text-parchment-dim">
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3">Số dư</th>
                <th className="px-4 py-3">Nạp tiền</th>
                <th className="px-4 py-3">Đơn hàng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/8">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-800/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-parchment">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-soft">
                        <Wallet className="h-4 w-4" />
                        ${u.balance.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-blue-400">
                        <CreditCard className="h-4 w-4" />
                        {u.totalDeposits}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-amber-400">
                        <ShoppingBag className="h-4 w-4" />
                        {u.totalOrders}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-gold-500/20 text-gold-300"
                            : "bg-ink-700 text-muted"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
