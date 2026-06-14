"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

function genCode() {
  return "DH" + randomBytes(4).toString("hex").toUpperCase();
}

export type CartResult = { ok: boolean; error?: string; count?: number };

export async function addToCartAction(productId: string): Promise<CartResult> {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active || product.stock <= 0) {
    return { ok: false, error: "unavailable" };
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: me.id, productId } },
  });
  const nextQty = Math.min((existing?.qty ?? 0) + 1, product.stock);

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: me.id, productId } },
    create: { userId: me.id, productId, qty: 1 },
    update: { qty: nextQty },
  });

  revalidatePath("/gio-hang");
  const agg = await prisma.cartItem.aggregate({ where: { userId: me.id }, _sum: { qty: true } });
  return { ok: true, count: agg._sum.qty ?? 0 };
}

export async function updateCartQtyAction(itemId: string, qty: number) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: me.id },
    include: { product: true },
  });
  if (!item) return;

  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { qty: Math.min(qty, item.product.stock) },
    });
  }
  revalidatePath("/gio-hang");
}

export async function removeCartItemAction(itemId: string) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");
  await prisma.cartItem.deleteMany({ where: { id: itemId, userId: me.id } });
  revalidatePath("/gio-hang");
}

export async function checkoutAction(): Promise<CartResult> {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const items = await prisma.cartItem.findMany({
    where: { userId: me.id },
    include: { product: true },
  });
  if (items.length === 0) return { ok: false, error: "empty" };

  for (const it of items) {
    if (!it.product.active || it.product.stock < it.qty) {
      return { ok: false, error: "stock" };
    }
  }

  const total =
    Math.round(items.reduce((s, it) => s + it.product.price * it.qty, 0) * 100) / 100;

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || user.balance < total) return { ok: false, error: "balance" };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data: { balance: { decrement: total } } });

    for (const it of items) {
      // giao dữ liệu từ kho (tối đa it.qty item khả dụng)
      const stock = await tx.stockItem.findMany({
        where: { productId: it.productId, status: "AVAILABLE" },
        take: it.qty,
        orderBy: { createdAt: "asc" },
      });
      const delivered = stock.map((s) => s.content).join("\n") || null;

      const order = await tx.order.create({
        data: {
          code: genCode(),
          userId: me.id,
          productId: it.productId,
          productName: it.product.name,
          price: it.product.price,
          qty: it.qty,
          total: Math.round(it.product.price * it.qty * 100) / 100,
          deliveredContent: delivered,
          delivered: stock.length >= it.qty && stock.length > 0,
        },
      });
      if (stock.length) {
        await tx.stockItem.updateMany({
          where: { id: { in: stock.map((s) => s.id) } },
          data: { status: "SOLD", orderId: order.id },
        });
      }
      await tx.product.update({
        where: { id: it.productId },
        data: { stock: { decrement: it.qty }, sold: { increment: it.qty } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: me.id } });
  });

  revalidatePath("/");
  revalidatePath("/don-hang");
  revalidatePath("/gio-hang");
  redirect("/don-hang?ok=checkout");
}
