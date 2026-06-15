"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, withRetry } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isAuthed } from "@/lib/auth";
import { DEPOSIT_METHODS, isValidMethod, type DepositMethod } from "@/lib/deposit-config";
import { createNotification } from "@/lib/notify";
import { fetchIncoming } from "@/lib/chain";

function genCode() {
  return "NAP" + randomBytes(4).toString("hex").toUpperCase();
}

/**
 * Sinh số tiền crypto ĐỘC NHẤT cho lệnh nạp (thêm phần lẻ nhỏ) để khớp tự động
 * trên 1 địa chỉ ví dùng chung. Tránh trùng với các lệnh PENDING cùng phương thức.
 */
async function uniqueCryptoAmount(method: DepositMethod, base: number): Promise<number> {
  const step = method.symbol === "USDT" ? 0.0001 : 0.000001; // tối đa ~1 cent
  for (let i = 0; i < 25; i++) {
    const units = 1 + Math.floor(Math.random() * 99); // 1..99
    const amount = Math.round((base + units * step) * 1e8) / 1e8;
    const clash = await prisma.depositOrder.findFirst({
      where: { method: method.key, status: "PENDING", cryptoAmount: amount },
    });
    if (!clash) return amount;
  }
  return Math.round((base + ((Date.now() % 99) + 1) * step) * 1e8) / 1e8;
}

/** User tạo lệnh nạp → chuyển tới trang hướng dẫn /nap-tien/[code]. */
export async function createDepositAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const methodKey = String(formData.get("method") ?? "");
  if (!isValidMethod(methodKey)) redirect("/nap-tien?error=method");
  const method = DEPOSIT_METHODS[methodKey];

  const amountUsd = Math.round(Number(formData.get("amount") ?? 0) * 100) / 100;
  if (!Number.isFinite(amountUsd) || amountUsd < 1) redirect("/nap-tien?error=amount");

  const base = amountUsd / method.usdPerUnit;
  const cryptoAmount = await uniqueCryptoAmount(method, base);

  const order = await prisma.depositOrder.create({
    data: {
      code: genCode(),
      userId: me.id,
      method: method.key,
      symbol: method.symbol,
      network: method.network,
      amountUsd,
      cryptoAmount,
      address: method.address,
    },
  });

  redirect(`/nap-tien/${order.code}`);
}

/* ----------------- tự động khớp & cộng tiền on-chain ----------------- */

export type CheckResult = { status: string; credited?: number };

/** Kiểm tra blockchain xem lệnh nạp đã có tiền tới chưa → tự cộng nếu khớp. */
export async function checkDepositAction(code: string): Promise<CheckResult> {
  const me = await getCurrentUser();
  if (!me) return { status: "PENDING" };

  const order = await prisma.depositOrder.findUnique({ where: { code } });
  if (!order || order.userId !== me.id) return { status: "PENDING" };
  if (order.status !== "PENDING") return { status: order.status };

  let txs;
  try {
    txs = await fetchIncoming(order.method, order.address);
  } catch (e) {
    console.error("[checkDeposit] đọc blockchain lỗi:", e);
    return { status: "PENDING" };
  }

  const tol = order.symbol === "USDT" ? 0.00005 : 0.0000005;
  const sinceTs = Math.floor(order.createdAt.getTime() / 1000) - 600; // đệm 10 phút

  for (const tx of txs) {
    if (Math.abs(tx.amount - order.cryptoAmount) > tol) continue;
    if (tx.ts && tx.ts < sinceTs) continue;

    // tx này đã dùng cho lệnh khác chưa?
    const used = await prisma.depositOrder.findUnique({ where: { txHash: tx.hash } });
    if (used) continue;

    try {
      await withRetry(() =>
        prisma.$transaction([
          prisma.depositOrder.update({
            where: { id: order.id },
            data: { status: "COMPLETED", confirmedAt: new Date(), txHash: tx.hash },
          }),
          prisma.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.amountUsd } },
          }),
        ]),
      );
    } catch (e) {
      console.error("[checkDeposit] cộng tiền lỗi:", e);
      const fresh = await prisma.depositOrder.findUnique({ where: { id: order.id } });
      return { status: fresh?.status ?? "PENDING" };
    }

    await createNotification({
      userId: order.userId,
      type: "DEPOSIT",
      amount: order.amountUsd,
      href: `/nap-tien/${order.code}`,
    });
    revalidatePath("/nap-tien");
    revalidatePath("/admin/deposits");
    return { status: "COMPLETED", credited: order.amountUsd };
  }

  return { status: "PENDING" };
}

/* --------------------------- admin --------------------------- */

async function requireAdmin() {
  if (!(await isAuthed())) redirect("/admin/login");
}

export async function approveDepositAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/deposits");

  const order = await prisma.depositOrder.findUnique({ where: { id } });
  if (order && order.status === "PENDING") {
    await prisma.$transaction([
      prisma.depositOrder.update({
        where: { id },
        data: { status: "COMPLETED", confirmedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.amountUsd } },
      }),
    ]);
    await createNotification({
      userId: order.userId,
      type: "DEPOSIT",
      amount: order.amountUsd,
      href: `/nap-tien/${order.code}`,
    });
  }

  revalidatePath("/admin/deposits");
  revalidatePath("/nap-tien");
  redirect("/admin/deposits?ok=approved");
}

export async function rejectDepositAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.depositOrder.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
  }
  revalidatePath("/admin/deposits");
  redirect("/admin/deposits?ok=rejected");
}
