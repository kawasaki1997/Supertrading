"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createUserSession,
  destroyUserSession,
  getCurrentUser,
} from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function baseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3100";
}

/* --------------------------- register / login --------------------------- */

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) redirect("/dang-ky?error=missing");
  if (!emailRe.test(email)) redirect("/dang-ky?error=email");
  if (password.length < 6) redirect("/dang-ky?error=short");
  if (password !== confirm) redirect("/dang-ky?error=match");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect("/dang-ky?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  await createUserSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/dang-nhap?error=missing");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/dang-nhap?error=invalid");
  }
  await createUserSession(user.id);
  redirect("/");
}

export async function logoutUserAction() {
  await destroyUserSession();
  redirect("/");
}

/* ------------------------------- profile -------------------------------- */

export async function updateProfileAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/ho-so?error=name");

  await prisma.user.update({ where: { id: me.id }, data: { name } });
  redirect("/ho-so?ok=profile");
}

export async function changePasswordAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next) redirect("/ho-so?error=missing");
  if (next.length < 6) redirect("/ho-so?error=short");
  if (next !== confirm) redirect("/ho-so?error=match");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    redirect("/ho-so?error=current");
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash } });
  redirect("/ho-so?ok=password");
}

/* --------------------------- forgot / reset ----------------------------- */

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // Always behave the same way regardless of whether the email exists
  // (so attackers can't probe which emails are registered).
  if (emailRe.test(email)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });
      await sendPasswordResetEmail(
        email,
        `${baseUrl()}/dat-lai-mat-khau?token=${token}`,
      );
    }
  }

  redirect("/quen-mat-khau?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) redirect("/quen-mat-khau");
  if (next.length < 6) redirect(`/dat-lai-mat-khau?token=${token}&error=short`);
  if (next !== confirm) redirect(`/dat-lai-mat-khau?token=${token}&error=match`);

  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row || row.used || row.expiresAt < new Date()) {
    redirect("/dat-lai-mat-khau?error=invalid");
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { used: true } }),
    // log out everywhere for safety
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);

  redirect("/dang-nhap?reset=1");
}
