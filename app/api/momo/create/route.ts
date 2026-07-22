import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMoMoPayment } from "@/lib/momo";

export async function POST(req: NextRequest) {
  try {
    const { depositId } = await req.json();

    if (!depositId) {
      return NextResponse.json({ error: "Missing depositId" }, { status: 400 });
    }

    const deposit = await prisma.depositOrder.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.method !== "MOMO") {
      return NextResponse.json({ error: "Not a MoMo deposit" }, { status: 400 });
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json({ error: "Deposit already processed" }, { status: 400 });
    }

    // Tính số tiền VND
    const amountVND = Math.round(deposit.amountUsd / 0.00004);

    // Tạo payment request với MoMo
    const momoResponse = await createMoMoPayment({
      orderId: deposit.code,
      requestId: `${deposit.code}_${Date.now()}`,
      amount: amountVND,
      orderInfo: `Nap tien ${deposit.code}`,
    });

    if (momoResponse.resultCode !== 0) {
      return NextResponse.json(
        { error: "MoMo API error", details: momoResponse },
        { status: 500 }
      );
    }

    // Trả về payUrl để redirect user
    return NextResponse.json({
      payUrl: momoResponse.payUrl,
      deeplink: momoResponse.deeplink,
    });
  } catch (error) {
    console.error("Create MoMo payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
