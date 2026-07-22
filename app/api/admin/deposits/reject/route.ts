import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    if (deposit.status !== "PENDING") {
      return NextResponse.json({ error: "Deposit already processed" }, { status: 400 });
    }

    await prisma.depositOrder.update({
      where: { id: depositId },
      data: { status: "FAILED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject deposit error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
