"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, withRetry } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isAuthed } from "@/lib/auth";
import { getDepositMethods, isValidMethod, type DepositMethod } from "@/lib/deposit-config";
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

  const methods = await getDepositMethods();
  const method = methods[methodKey];

  const amountUsd = Math.round(Number(formData.get("amount") ?? 0) * 100) / 100;
  if (!Number.isFinite(amountUsd) || amountUsd < 1) redirect("/nap-tien?error=amount");

  const base = amountUsd / method.usdPerUnit;
  // Crypto khớp tự động bằng số tiền độc nhất (thêm phần lẻ nhỏ) trên ví dùng chung.
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

type PendingOrder = {
  id: string;
  code: string;
  userId: string;
  method: string;
  symbol: string;
  amountUsd: number;
  cryptoAmount: number;
  address: string;
  status: string;
  createdAt: Date;
};

// Cache blockchain txs để tránh rate limit (TTL 90s)
const txCache = new Map<string, { txs: any[]; expires: number }>();

/**
 * Lõi khớp & cộng tiền cho 1 lệnh nạp PENDING (KHÔNG phụ thuộc session).
 * Dùng chung cho: client tự dò (checkDepositAction) và cron server (settle-deposits route).
 */
export async function settleDepositOrder(order: PendingOrder): Promise<CheckResult> {
  if (order.status !== "PENDING") return { status: order.status };

  // Cache theo method+address để tránh gọi API blockchain nhiều lần
  const cacheKey = `${order.method}:${order.address}`;
  const cached = txCache.get(cacheKey);
  let txs;

  if (cached && cached.expires > Date.now()) {
    txs = cached.txs;
  } else {
    try {
      txs = await fetchIncoming(order.method, order.address, order.createdAt.getTime());
      txCache.set(cacheKey, { txs, expires: Date.now() + 90_000 });
    } catch (e) {
      console.error(`[settle ${order.code}] đọc blockchain lỗi:`, e);
      return { status: "PENDING" };
    }
  }

  // Khớp theo giá trị USD thay vì số lượng crypto tuyệt đối, để chấp nhận dao động tỉ giá
  const method = DEPOSIT_METHODS[order.method];
  const usdTolerance = 0.5; // cho phép sai số ±$0.50
  const sinceTs = Math.floor(order.createdAt.getTime() / 1000) - 600; // đệm 10 phút

  console.log(`[settle ${order.code}] method=${order.method} rate=${method.usdPerUnit} orderUsd=${order.amountUsd} txCount=${txs.length}`);

  for (const tx of txs) {
    const receivedUsd = tx.amount * method.usdPerUnit;
    console.log(`  tx ${tx.hash.slice(0,8)} amount=${tx.amount} → $${receivedUsd.toFixed(2)} vs order $${order.amountUsd} diff=$${Math.abs(receivedUsd - order.amountUsd).toFixed(2)}`);
    if (Math.abs(receivedUsd - order.amountUsd) > usdTolerance) continue;
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
      console.error(`[settle ${order.code}] cộng tiền lỗi:`, e);
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

/** Client tự dò (poll): kiểm tra 1 lệnh của chính mình đã có tiền tới chưa. */
export async function checkDepositAction(code: string): Promise<CheckResult> {
  const me = await getCurrentUser();
  if (!me) return { status: "PENDING" };

  const order = await prisma.depositOrder.findUnique({ where: { code } });
  if (!order || order.userId !== me.id) return { status: "PENDING" };

  return settleDepositOrder(order);
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
