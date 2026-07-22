"use client";

import { useState } from "react";

export function MomoButton({ depositId }: { depositId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/momo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId }),
      });
      const data = await res.json();
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        alert(data.error || "Không thể tạo thanh toán MoMo");
        setLoading(false);
      }
    } catch (err) {
      alert("Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Thanh toán với MoMo"}
    </button>
  );
}
