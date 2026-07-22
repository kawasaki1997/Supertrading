import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMoMoSignature } from "@/lib/momo";
import { withRetry } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify signature
    if (!verifyMoMoSignature(body)) {
      console.error("Invalid MoMo signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { orderId, resultCode, amount, transId } = body;

    // resultCode = 0 nghĩa là thanh toán thành công
    if (resultCode !== 0) {
      console.log(`MoMo payment failed for ${orderId}, resultCode: ${resultCode}`);
      return NextResponse.json({ status: "failed" });
    }

    // Tìm deposit order theo code
    const deposit = await prisma.depositOrder.findFirst({
      where: { code: orderId },
    });

    if (!deposit) {
      console.error(`Deposit not found: ${orderId}`);
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status === "COMPLETED") {
      console.log(`Deposit ${orderId} already completed`);
      return NextResponse.json({ status: "already_completed" });
    }

    // Verify amount
    const expectedVND = Math.round(deposit.amountUsd / 0.00004);
    if (amount !== expectedVND) {
      console.error(`Amount mismatch for ${orderId}: expected ${expectedVND}, got ${amount}`);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Cộng tiền vào tài khoản
    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        await tx.depositOrder.update({
          where: { id: deposit.id },
          data: {
            status: "COMPLETED",
            txHash: transId, // Lưu MoMo transId vào txHash
          },
        });

        await tx.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.amountUsd } },
        });
      })
    );

    console.log(`✅ MoMo deposit ${orderId} completed, credited ${deposit.amountUsd} USD`);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("MoMo IPN error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
