"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signIn, signOut, isAuthed } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { createNotification } from "@/lib/notify";

/* ----------------------------- auth ----------------------------- */

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(password);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}

/* --------------------------- helpers ---------------------------- */

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/* -------------------------- products ---------------------------- */

export async function saveProduct(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const image = await uploadImage(formData.get("image"));

  const data = {
    name: String(formData.get("name") ?? "").trim(),
    price: num(formData.get("price")) ?? 0,
    oldPrice: num(formData.get("oldPrice")),
    stock: num(formData.get("stock")) ?? 0,
    sold: num(formData.get("sold")) ?? 0,
    badge: (String(formData.get("badge") ?? "").trim() || null) as string | null,
    categoryId: String(formData.get("categoryId") ?? ""),
    order: num(formData.get("order")) ?? 0,
    active: formData.get("active") === "on",
    ...(image ? { image } : {}),
  };

  if (!data.name || !data.categoryId) redirect("/admin?error=missing");

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=product");
}

export async function deleteProduct(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=deleted");
}

/* -------------------------- categories -------------------------- */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export async function saveCategory(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const order = num(formData.get("order")) ?? 0;
  if (!title) redirect("/admin?error=missing");

  let slug = slugify(String(formData.get("slug") ?? "") || title);
  // Ensure slug uniqueness (ignore the row we're editing)
  const clash = await prisma.category.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
  });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

  if (id) {
    await prisma.category.update({ where: { id }, data: { title, subtitle, slug, order } });
  } else {
    await prisma.category.create({ data: { title, subtitle, slug, order } });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=category");
}

export async function deleteCategory(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.category.delete({ where: { id } }); // cascades to products
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=deleted");
}

/* --------------------------- inventory (kho) --------------------------- */

export async function addStockAction(formData: FormData) {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const raw = String(formData.get("content") ?? "");
  if (!productId) redirect("/admin?error=missing");

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length > 0) {
    await prisma.$transaction([
      prisma.stockItem.createMany({
        data: lines.map((content) => ({ productId, content })),
      }),
      // tăng tồn kho hiển thị theo số lượng vừa nhập
      prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: lines.length } },
      }),
    ]);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=stock");
}

/* ----------------------------- reports -------------------------------- */

export async function resolveReportAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const reply = String(formData.get("reply") ?? "").trim() || null;
  if (id) {
    const report = await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED", adminReply: reply },
    });
    await createNotification({
      userId: report.userId,
      type: "REPORT",
      href: report.orderCode ? `/don-hang/${report.orderCode}` : "/khieu-nai",
    });
  }
  revalidatePath("/admin/reports");
  redirect("/admin/reports?ok=resolved");
}
