import { prisma } from "./db";

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  qty: number;
  lineTotal: number;
  deliveryType: string; // AUTO | MANUAL
};

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { product: true },
  });

  const lines: CartLine[] = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product.name,
    price: i.product.price,
    image: i.product.image,
    stock: i.product.stock,
    qty: i.qty,
    lineTotal: Math.round(i.product.price * i.qty * 100) / 100,
    deliveryType: i.product.deliveryType,
  }));

  const total = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { lines, total, count };
}

export async function getCartCount(userId: string): Promise<number> {
  const agg = await prisma.cartItem.aggregate({
    where: { userId },
    _sum: { qty: true },
  });
  return agg._sum.qty ?? 0;
}
