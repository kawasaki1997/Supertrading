import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { settleDepositOrder } from "@/lib/deposit-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel: cho phép chạy tới 60s

/**
 * Cron tự cộng tiền cho MỌI lệnh nạp crypto đang chờ — kể cả khi khách đã offline.
 * Cấu hình trong vercel.json (schedule). Bảo vệ bằng CRON_SECRET:
 *   - Vercel Cron tự gửi header "Authorization: Bearer <CRON_SECRET>".
 *   - Gọi thủ công: thêm ?key=<CRON_SECRET> hoặc header Authorization.
 * Nếu KHÔNG đặt CRON_SECRET → route bị khóa (tránh ai cũng gọi được).
 */
async function handle(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET chưa cấu hình" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const keyParam = new URL(req.url).searchParams.get("key") ?? "";
  if (auth !== `Bearer ${secret}` && keyParam !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Chỉ xét lệnh crypto còn chờ, tạo trong 24h gần đây (node công khai chỉ giữ log ~5h;
  // giới hạn 24h để không quét vô ích các lệnh quá cũ chắc chắn không khớp được nữa).
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pending = await prisma.depositOrder.findMany({
    where: { status: "PENDING", createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let credited = 0;
  const results: Array<{ code: string; status: string }> = [];
  // Tuần tự để không làm nghẽn RPC công khai (mỗi lệnh quét nhiều chunk block).
  for (const order of pending) {
    const res = await settleDepositOrder(order);
    if (res.status === "COMPLETED") credited++;
    results.push({ code: order.code, status: res.status });
  }

  return NextResponse.json({ ok: true, scanned: pending.length, credited, results });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
