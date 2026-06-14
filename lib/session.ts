import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "./db";
import type { SessionUser } from "./types";

export const USER_COOKIE = "st_user";
const SESSION_DAYS = 30;

export async function createUserSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const u = session.user;
  return { id: u.id, email: u.email, name: u.name, balance: u.balance, role: u.role };
}

export async function destroyUserSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(USER_COOKIE);
}
