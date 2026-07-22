import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRetry } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { depositId, userId } = await req.json();

    if (!depositId || !userId) {
      return NextResponse.json({ error: "Missing depositId or userId" }, { status: 400 });
    }

    const deposit = await prisma.depositOrder.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json({ error: "Deposit already processed" }, { status: 400 });
    }

    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        await tx.depositOrder.update({
          where: { id: depositId },
          data: { status: "COMPLETED" },
        });

        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: deposit.amountUsd } },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve deposit error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
