import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Trên serverless (Vercel) + Supabase pooler, kết nối phải an toàn nếu không
 * sẽ lỗi NGẪU NHIÊN ("prepared statement already exists" / cạn kết nối).
 * Tự thêm tham số khi chạy production để không phụ thuộc việc cấu hình env:
 *  - pgbouncer=true     → tắt prepared statement (bắt buộc với transaction pooler)
 *  - connection_limit=1 → mỗi function chỉ giữ 1 kết nối, tránh cạn pool
 */
function runtimeDbUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw || process.env.NODE_ENV !== "production") return raw;
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    return u.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: runtimeDbUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Chạy lại 1 lần nếu gặp lỗi kết nối thoáng qua (transient) của pooler.
 * Giúp thao tác admin "lúc được lúc không" trở nên ổn định.
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const transient =
      /prepared statement|connection|ECONNRESET|terminating|too many|timeout|Closed/i.test(msg);
    if (!transient) throw e;
    await new Promise((r) => setTimeout(r, 250));
    return await fn();
  }
}
