"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, withRetry } from "@/lib/db";
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
    deliveryType: String(formData.get("deliveryType") ?? "") === "MANUAL" ? "MANUAL" : "AUTO",
    ...(image ? { image } : {}),
  };

  if (!data.name || !data.categoryId) redirect("/admin?error=missing");

  let failed = false;
  try {
    await withRetry(() =>
      id
        ? prisma.product.update({ where: { id }, data })
        : prisma.product.create({ data }),
    );
  } catch (e) {
    console.error("[saveProduct] lưu thất bại:", e);
    failed = true;
  }
  if (failed) redirect("/admin?error=save");

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

  let failed = false;
  try {
    await withRetry(() =>
      id
        ? prisma.category.update({ where: { id }, data: { title, subtitle, slug, order } })
        : prisma.category.create({ data: { title, subtitle, slug, order } }),
    );
  } catch (e) {
    console.error("[saveCategory] lưu thất bại:", e);
    failed = true;
  }
  if (failed) redirect("/admin?error=save");

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

  let failed = false;
  if (lines.length > 0) {
    try {
      await withRetry(async () => {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { autoSyncStock: true }
        });

        await prisma.$transaction(async (tx) => {
          await tx.stockItem.createMany({
            data: lines.map((content) => ({ productId, content })),
          });

          // Nếu autoSyncStock bật, tính lại từ StockItem; nếu không thì tăng thủ công
          if (product?.autoSyncStock) {
            const availableCount = await tx.stockItem.count({
              where: { productId, status: "AVAILABLE" }
            });
            await tx.product.update({
              where: { id: productId },
              data: { stock: availableCount }
            });
          } else {
            await tx.product.update({
              where: { id: productId },
              data: { stock: { increment: lines.length } },
            });
          }
        });
      });
    } catch (e) {
      console.error("[addStock] lưu thất bại:", e);
      failed = true;
    }
  }
  if (failed) redirect("/admin?error=save");

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=stock");
}

export async function deleteStockItemAction(formData: FormData) {
  await requireAuth();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) redirect("/admin?error=missing");

  let failed = false;
  let productId = "";
  try {
    const item = await prisma.stockItem.findUnique({ where: { id: itemId } });
    if (item && item.status === "AVAILABLE") {
      productId = item.productId;
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { autoSyncStock: true }
      });

      await withRetry(() =>
        prisma.$transaction(async (tx) => {
          await tx.stockItem.delete({ where: { id: itemId } });

          // Nếu autoSyncStock bật, tính lại từ StockItem; nếu không thì trừ thủ công
          if (product?.autoSyncStock) {
            const availableCount = await tx.stockItem.count({
              where: { productId, status: "AVAILABLE" }
            });
            await tx.product.update({
              where: { id: productId },
              data: { stock: availableCount }
            });
          } else {
            await tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: 1 } },
            });
          }
        }),
      );
    }
  } catch (e) {
    console.error("[deleteStockItem] xóa thất bại:", e);
    failed = true;
  }
  if (failed) redirect("/admin?error=delete");

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/stock/${productId}`);
  redirect(`/admin/stock/${productId}?ok=deleted`);
}

/* --------------------------- manual orders ---------------------------- */

export async function markOrderDeliveredAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (order && order.status === "PENDING") {
      await prisma.order.update({
        where: { id },
        data: { status: "DELIVERED", delivered: true },
      });
      await createNotification({
        userId: order.userId,
        type: "ORDER",
        text: order.productName,
        href: `/don-hang/${order.code}`,
      });
    }
  }
  revalidatePath("/admin/orders");
  revalidatePath("/don-hang");
  redirect("/admin/orders?ok=delivered");
}

/** Sync lại stock cho tất cả sản phẩm từ StockItem */
export async function syncAllProductStockAction() {
  await requireAuth();

  try {
    const products = await prisma.product.findMany({
      select: { id: true }
    });

    let syncedCount = 0;

    for (const product of products) {
      // Chỉ đếm StockItem có status AVAILABLE
      const availableCount = await prisma.stockItem.count({
        where: {
          productId: product.id,
          status: "AVAILABLE"
        }
      });

      await prisma.product.update({
        where: { id: product.id },
        data: { stock: availableCount }
      });

      syncedCount++;
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/stock');
    redirect(`/admin/stock/sync?ok=synced&count=${syncedCount}`);
  } catch (error) {
    console.error('Error syncing all product stock:', error);
    redirect('/admin/stock/sync?error=sync');
  }
}

/** Bật chế độ tự động sync stock cho một sản phẩm */
export async function toggleAutoSyncStockAction(formData: FormData) {
  await requireAuth();
  const productId = String(formData.get("productId") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";

  if (productId) {
    await prisma.product.update({
      where: { id: productId },
      data: { autoSyncStock: enabled }
    });

    revalidatePath('/admin/products');
    revalidatePath(`/admin/stock/${productId}`);
  }

  redirect(`/admin/stock/${productId}?ok=auto-${enabled ? 'enabled' : 'disabled'}`);
}

/** Hủy đơn giao tay & hoàn toàn bộ tiền về ví khách. */
export async function cancelOrderAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (order && order.status !== "CANCELLED" && order.deliveryType === "MANUAL") {
      await prisma.$transaction([
        prisma.order.update({ where: { id }, data: { status: "CANCELLED" } }),
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.total } },
        }),
        // trả lại tồn kho hiển thị
        ...(order.productId
          ? [
              prisma.product.update({
                where: { id: order.productId },
                data: { stock: { increment: order.qty }, sold: { decrement: order.qty } },
              }),
            ]
          : []),
      ]);
      await createNotification({
        userId: order.userId,
        type: "ORDER",
        text: order.productName,
        href: `/don-hang/${order.code}`,
      });
    }
  }
  revalidatePath("/admin/orders");
  revalidatePath("/don-hang");
  redirect("/admin/orders?ok=cancelled");
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
