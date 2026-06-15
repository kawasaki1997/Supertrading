"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export type BuyResult =
  | { ok: true; code: string }
  | { ok: false; error: "unavailable" | "stock" | "balance" | "username" };

export type BuyExtra = { gameUsername?: string; gameNote?: string; qty?: number };

function genCode() {
  return "DH" + randomBytes(4).toString("hex").toUpperCase();
}

/** Mua ngay 1 sản phẩm: trừ số dư, giảm tồn kho, tạo đơn.
 *  - AUTO: giao dữ liệu tài khoản/vật phẩm từ kho ngay, đơn COMPLETED.
 *  - MANUAL: lưu nick game khách, đơn PENDING chờ admin giao tay.
 */
export async function buyProductAction(
  productId: string,
  extra: BuyExtra = {},
): Promise<BuyResult> {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return { ok: false, error: "unavailable" };
  if (product.stock <= 0) return { ok: false, error: "stock" };

  // Số lượng: tối thiểu 1, tối đa tồn kho hiện có.
  const qty = Math.max(1, Math.min(Math.floor(extra.qty ?? 1), product.stock));

  const manual = product.deliveryType === "MANUAL";
  const gameUsername = (extra.gameUsername ?? "").trim();
  const gameNote = (extra.gameNote ?? "").trim() || null;
  if (manual && !gameUsername) return { ok: false, error: "username" };

  const total = Math.round(product.price * qty * 100) / 100;

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || user.balance < total) return { ok: false, error: "balance" };

  const code = genCode();
  await prisma.$transaction(async (tx) => {
    // Chỉ đơn AUTO mới lấy dữ liệu từ kho; đơn MANUAL giao tay nên bỏ qua.
    const items = manual
      ? []
      : await tx.stockItem.findMany({
          where: { productId: product.id, status: "AVAILABLE" },
          take: qty,
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
        qty,
        total,
        deliveryType: manual ? "MANUAL" : "AUTO",
        status: manual ? "PENDING" : "COMPLETED",
        gameUsername: manual ? gameUsername : null,
        gameNote: manual ? gameNote : null,
        deliveredContent: delivered,
        delivered: !manual && items.length >= qty && items.length > 0,
      },
    });
    if (items.length) {
      await tx.stockItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { status: "SOLD", orderId: order.id },
      });
    }
    await tx.user.update({ where: { id: user.id }, data: { balance: { decrement: total } } });
    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: qty }, sold: { increment: qty } },
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
  revalidatePath("/admin/orders");
  return { ok: true, code };
}
