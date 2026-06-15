"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isAuthed } from "@/lib/auth";
import { DEPOSIT_METHODS, isValidMethod } from "@/lib/deposit-config";
import { createNotification } from "@/lib/notify";

function genCode() {
  return "NAP" + randomBytes(4).toString("hex").toUpperCase();
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

  const cryptoAmount =
    Math.round((amountUsd / method.usdPerUnit) * 1e8) / 1e8;

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
