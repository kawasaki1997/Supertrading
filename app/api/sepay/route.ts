import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { getConfig } from "@/lib/app-config";

export const dynamic = "force-dynamic";

/**
 * Webhook SePay — gọi khi có tiền VÀO tài khoản ngân hàng.
 * Khớp lệnh nạp BANK bằng nội dung CK (chứa mã lệnh), rồi tự cộng số dư.
 * Cấu hình ở SePay: URL = https://<domain>/api/sepay, Header Authorization = "Apikey <SEPAY_API_KEY>".
 */
export async function POST(req: Request) {
  // Ưu tiên env (Vercel); nếu chưa đặt thì lấy từ DB (bảng AppConfig) → không cần commit secret.
  const secret = process.env.SEPAY_API_KEY || (await getConfig("sepay_api_key"));
  if (!secret) return NextResponse.json({ success: false, error: "not configured" }, { status: 503 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Apikey ${secret}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    id?: number | string;
    transferType?: string;
    transferAmount?: number;
    content?: string;
    description?: string;
    referenceCode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "bad json" }, { status: 400 });
  }

  // Chỉ xử lý tiền VÀO
  if (body.transferType && body.transferType !== "in") {
    return NextResponse.json({ success: true, skipped: "not incoming" });
  }

  const amount = Number(body.transferAmount ?? 0);
  const raw = `${body.content ?? ""} ${body.description ?? ""}`.toUpperCase();
  const normalized = raw.replace(/[^A-Z0-9]/g, "");
  const txId = "SEPAY-" + String(body.id ?? body.referenceCode ?? Date.now());

  // Tìm lệnh BANK đang chờ có MÃ nằm trong nội dung CK
  const pending = await prisma.depositOrder.findMany({
    where: { method: "BANK", status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const order = pending.find((o) => normalized.includes(o.code.toUpperCase()));

  if (!order) {
    // Không khớp lệnh nào — vẫn trả 200 để SePay không gửi lại liên tục
    return NextResponse.json({ success: true, matched: false });
  }
  // Số tiền phải đủ (cho phép chuyển dư)
  if (amount + 1 < order.cryptoAmount) {
    return NextResponse.json({ success: true, matched: order.code, error: "amount too low" });
  }

  try {
    await withRetry(() =>
      prisma.$transaction([
        prisma.depositOrder.update({
          where: { id: order.id },
          data: { status: "COMPLETED", confirmedAt: new Date(), txHash: txId },
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.amountUsd } },
        }),
      ]),
    );
  } catch (e) {
    // txHash @unique → webhook gửi lại trùng, đã cộng rồi
    console.error("[sepay] credit:", e);
    return NextResponse.json({ success: true, matched: order.code, note: "already processed" });
  }

  await createNotification({
    userId: order.userId,
    type: "DEPOSIT",
    amount: order.amountUsd,
    href: `/nap-tien/${order.code}`,
  });

  return NextResponse.json({ success: true, matched: order.code, credited: order.amountUsd });
}
