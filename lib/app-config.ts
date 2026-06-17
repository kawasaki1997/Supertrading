import { prisma } from "./db";

/**
 * Đọc cấu hình động lưu trong DB (bảng AppConfig). Dùng cho các giá trị bí mật/cấu hình
 * không muốn commit vào code và không tiện đặt ở env (vd: SEPAY_API_KEY).
 * Local & production dùng chung 1 Supabase DB nên set 1 lần là áp dụng cả hai.
 */
export async function getConfig(key: string): Promise<string | null> {
  try {
    const row = await prisma.appConfig.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setConfig(key: string, value: string): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
