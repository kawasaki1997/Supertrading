"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type Deposit = {
  id: string;
  code: string;
  username: string;
  email: string;
  amountUsd: number;
  amountVnd: number;
  createdAt: string;
  userId: string;
};

export function DepositApproval({ deposits }: { deposits: Deposit[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [list, setList] = useState(deposits);

  async function approve(deposit: Deposit) {
    if (!confirm(`Duyệt cộng $${deposit.amountUsd.toFixed(2)} cho ${deposit.username}?`)) return;
    setLoading(deposit.id);
    const res = await fetch("/api/admin/deposits/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositId: deposit.id, userId: deposit.userId }),
    });
    if (res.ok) {
      setList((prev) => prev.filter((d) => d.id !== deposit.id));
      alert("Đã duyệt và cộng tiền thành công");
    } else {
      alert("Lỗi: " + (await res.text()));
    }
    setLoading(null);
  }

  async function reject(deposit: Deposit) {
    if (!confirm(`Từ chối lệnh ${deposit.code}?`)) return;
    setLoading(deposit.id);
    const res = await fetch("/api/admin/deposits/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositId: deposit.id }),
    });
    if (res.ok) {
      setList((prev) => prev.filter((d) => d.id !== deposit.id));
      alert("Đã từ chối lệnh");
    } else {
      alert("Lỗi: " + (await res.text()));
    }
    setLoading(null);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Duyệt lệnh nạp tiền BANK</h1>
      {list.length === 0 ? (
        <p className="text-gray-500">Không có lệnh nào đang chờ duyệt</p>
      ) : (
        <div className="space-y-4">
          {list.map((d) => (
            <div key={d.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Mã lệnh</p>
                  <p className="font-mono font-bold">{d.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-semibold">{d.username}</p>
                  <p className="text-sm text-gray-500">{d.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-bold text-lg">{d.amountVnd.toLocaleString()} VND</p>
                  <p className="text-sm text-gray-500">${d.amountUsd.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian tạo</p>
                  <p className="text-sm">{new Date(d.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => approve(d)}
                  disabled={loading === d.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={18} />
                  Duyệt & cộng tiền
                </button>
                <button
                  onClick={() => reject(d)}
                  disabled={loading === d.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={18} />
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
