import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_BUCKET || "uploads";

/**
 * Lưu ảnh upload — KHÔNG BAO GIỜ ném lỗi (để không làm treo nút Lưu).
 * - Có SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → đẩy lên Supabase Storage.
 * - Local dev (không phải production) → lưu vào public/uploads.
 * - Nếu thất bại / chưa cấu hình → trả về undefined (sản phẩm vẫn lưu, chỉ là không đổi ảnh).
 */
export async function uploadImage(
  file: FormDataEntryValue | null,
): Promise<string | undefined> {
  if (!file || typeof file === "string") return undefined;
  const f = file as File;
  if (!f.size) return undefined;

  try {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await f.arrayBuffer());

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(name, buffer, { contentType: f.type || "image/jpeg", upsert: false });
      if (error) {
        console.error("[upload] Supabase Storage lỗi:", error.message);
        return undefined;
      }
      return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
    }

    // Local dev fallback (KHÔNG chạy trên Vercel vì filesystem chỉ đọc)
    if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), buffer);
      return `/uploads/${name}`;
    }

    console.warn("[upload] Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY — bỏ qua ảnh.");
    return undefined;
  } catch (e) {
    console.error("[upload] Thất bại (bỏ qua ảnh, sản phẩm vẫn lưu):", e);
    return undefined;
  }
}
