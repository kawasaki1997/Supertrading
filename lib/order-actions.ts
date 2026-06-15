"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export type BuyResult =
  | { ok: true; code: string }
  | { ok: false; error: "unavailable" | "stock" | "balance" };

function genCode() {
  return "DH" + randomBytes(4).toString("hex").toUpperCase();
}

/** Mua ngay 1 sản phẩm: trừ số dư, giảm tồn kho, giao dữ liệu từ kho, tạo đơn. */
export async function buyProductAction(productId: string): Promise<BuyResult> {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return { ok: false, error: "unavailable" };
  if (product.stock <= 0) return { ok: false, error: "stock" };

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || user.balance < product.price) return { ok: false, error: "balance" };

  const code = genCode();
  await prisma.$transaction(async (tx) => {
    const items = await tx.stockItem.findMany({
      where: { productId: product.id, status: "AVAILABLE" },
      take: 1,
      orderBy: { createdAt: "asc" },
    });
    const delivered = items.map((s) => s.content).join("\n") || null;

    const order = await tx.order.create({
      data: {
        code,
        userId: user.id,
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty: 1,
        total: product.price,
        deliveredContent: delivered,
        delivered: !!delivered,
      },
    });
    if (items.length) {
      await tx.stockItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { status: "SOLD", orderId: order.id },
      });
    }
    await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: product.price } } });
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: 1 }, sold: { increment: 1 } },
    });
  });

  await createNotification({
    userId: me.id,
    type: "ORDER",
    text: product.name,
    href: `/don-hang/${code}`,
  });

  revalidatePath("/");
  revalidatePath("/don-hang");
  return { ok: true, code };
}
