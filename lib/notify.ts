import { prisma } from "./db";

export async function createNotification(data: {
  userId: string;
  type: "DEPOSIT" | "ORDER" | "REPORT";
  amount?: number | null;
  text?: string | null;
  href?: string | null;
}) {
  await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      amount: data.amount ?? null,
      text: data.text ?? null,
      href: data.href ?? null,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
