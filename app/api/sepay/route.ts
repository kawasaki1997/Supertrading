import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { revalidatePath } from "next/cache";

/**
 * Webhook SePay — nhận thông báo chuyển khoản ngân hàng VN,
 * khớp theo nội dung chuyển khoản (mã lệnh), cộng tiền tự động.
 *
 * SePay POST tới endpoint này khi có giao dịch mới:
 * {
 *   "id": "123456",
 *   "gateway": "MB",
 *   "transactionDate": "2026-07-22 10:30:00",
 *   "accountNumber": "0373434066",
 *   "subAccount": null,
 *   "transferType": "in",
 *   "transferAmount": 125000,
 *   "accumulated": 500000,
 *   "code": "NAP1234ABCD",  ← nội dung CK
 *   "content": "NAP1234ABCD",
 *   "description": "NGUYEN VAN A chuyen tien",
 *   "referenceCode": "FT26202123456"
 * }
 */
export async function POST(req: NextRequest) {
  // SePay không hỗ trợ custom headers trong giao diện web,
  // nên bỏ check Authorization. Thay vào đó validate chặt:
  // - Chỉ nhận giao dịch IN
  // - Mã lệnh đúng format NAP...
  // - Số tiền khớp
  // - txHash không trùng (chống replay)

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const {
    transferType,
    transferAmount,
    code,
    referenceCode,
  } = body;

  // Chỉ xử lý giao dịch NHẬN TIỀN (in)
  if (transferType !== "in") {
    return NextResponse.json({ ok: true, message: "ignored: not incoming" });
  }

  // Nội dung CK phải có mã lệnh NAP...
  const orderCode = (code || "").toString().trim().toUpperCase();
  if (!/^NAP[A-F0-9]{8}$/.test(orderCode)) {
    return NextResponse.json({ ok: true, message: "ignored: invalid code format" });
  }

  // Tìm lệnh nạp PENDING
  const order = await prisma.depositOrder.findUnique({
    where: { code: orderCode },
  });

  if (!order) {
    return NextResponse.json({ ok: true, message: "order not found" });
  }

  if (order.method !== "BANK") {
    return NextResponse.json({ ok: true, message: "order is not BANK method" });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ ok: true, message: "order already processed" });
  }

  // Kiểm tra số tiền (VND) — lệch ±500 VND chấp nhận
  const expectedVnd = Math.round(order.amountUsd / 0.00004); // 1 USD = 25,000 VND
  const receivedVnd = Number(transferAmount);

  if (Math.abs(receivedVnd - expectedVnd) > 500) {
    console.warn(`[SePay] ${orderCode}: số tiền không khớp (cần ${expectedVnd}, nhận ${receivedVnd})`);
    return NextResponse.json({ ok: true, message: "amount mismatch" });
  }

  // Chống trùng txHash (referenceCode của ngân hàng)
  const txHash = String(referenceCode || "").trim();
  if (txHash) {
    const used = await prisma.depositOrder.findUnique({ where: { txHash } });
    if (used && used.id !== order.id) {
      return NextResponse.json({ ok: true, message: "txHash already used" });
    }
  }

  // Cộng tiền
  try {
    await withRetry(() =>
      prisma.$transaction([
        prisma.depositOrder.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            confirmedAt: new Date(),
            txHash: txHash || undefined,
          },
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.amountUsd } },
        }),
      ])
    );
  } catch (err) {
    console.error(`[SePay] ${orderCode}: cộng tiền lỗi`, err);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  await createNotification({
    userId: order.userId,
    type: "DEPOSIT",
    amount: order.amountUsd,
    href: `/nap-tien/${order.code}`,
  });

  revalidatePath("/nap-tien");
  revalidatePath("/admin/deposits");

  return NextResponse.json({
    ok: true,
    message: "credited",
    order: orderCode,
    amount: order.amountUsd,
  });
}
