"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Khách gửi báo lỗi cho 1 đơn hàng → tạo khiếu nại cho admin. */
export async function submitReportAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const orderCode = String(formData.get("orderCode") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!message) redirect(`/don-hang/${orderCode}?error=empty`);

  const order = orderCode
    ? await prisma.order.findFirst({ where: { code: orderCode, userId: me.id } })
    : null;

  await prisma.report.create({
    data: {
      userId: me.id,
      orderId: order?.id ?? null,
      orderCode: orderCode || null,
      message,
    },
  });

  revalidatePath("/admin/reports");
  redirect(`/don-hang/${orderCode}?reported=1`);
}

/** Khách gửi yêu cầu hỗ trợ chung (không gắn đơn) → tạo khiếu nại cho admin. */
export async function submitSupportAction(formData: FormData) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const message = String(formData.get("message") ?? "").trim();
  if (!message) redirect("/ho-tro?error=empty");

  await prisma.report.create({
    data: { userId: me.id, orderId: null, orderCode: null, message },
  });

  revalidatePath("/admin/reports");
  redirect("/ho-tro?sent=1");
}
