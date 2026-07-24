import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { settleDepositOrder } from "@/lib/deposit-actions";

/**
 * Cron job tự động khớp & cộng tiền cho tất cả lệnh nạp PENDING.
 * Gọi định kỳ mỗi 2-5 phút để quét blockchain.
 */
export async function POST() {
  try {
    const pending = await prisma.depositOrder.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    const results = [];
    for (const order of pending) {
      const result = await settleDepositOrder(order);
      results.push({ code: order.code, ...result });
    }

    return NextResponse.json({
      ok: true,
      checked: pending.length,
      results,
    });
  } catch (e: any) {
    console.error("[settle-deposits] lỗi:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// Cho phép gọi từ Vercel Cron hoặc external monitoring
export async function GET() {
  return POST();
}
