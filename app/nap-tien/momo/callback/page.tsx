"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MoMoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");
    const orderId = searchParams.get("orderId");

    if (resultCode === "0") {
      setStatus("success");
      setTimeout(() => router.push("/nap-tien"), 3000);
    } else {
      setStatus("failed");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warmCream p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        {status === "checking" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4" />
            <h1 className="text-2xl font-serif mb-2">Đang xác nhận thanh toán...</h1>
            <p className="text-mutedText">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-emerald-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-serif mb-2">Thanh toán thành công!</h1>
            <p className="text-mutedText mb-4">
              Tiền đã được cộng vào tài khoản của bạn.
            </p>
            <p className="text-sm text-mutedText">
              Đang chuyển hướng đến trang giao dịch...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="text-rose-600 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-serif mb-2">Thanh toán thất bại</h1>
            <p className="text-mutedText mb-6">
              Giao dịch không thành công. Vui lòng thử lại.
            </p>
            <button
              onClick={() => router.push("/nap-tien")}
              className="px-6 py-2 bg-terracotta text-white rounded-full hover:bg-terracottaDark transition"
            >
              Quay lại nạp tiền
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function MoMoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-warmCream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta" />
      </div>
    }>
      <MoMoCallbackContent />
    </Suspense>
  );
}
