import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_BUCKET || "uploads";

/**
 * Lưu ảnh upload.
 * - Khi có SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (production) → đẩy lên Supabase Storage.
 * - Khi chưa cấu hình (local dev) → lưu vào public/uploads.
 * Trả về URL công khai của ảnh, hoặc undefined nếu không có file.
 */
export async function uploadImage(
  file: FormDataEntryValue | null,
): Promise<string | undefined> {
  if (!file || typeof file === "string") return undefined;
  const f = file as File;
  if (!f.size) return undefined;

  const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await f.arrayBuffer());

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(name, buffer, { contentType: f.type || "image/jpeg", upsert: false });
    if (error) throw new Error("Upload ảnh thất bại: " + error.message);
    return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }

  // Local dev fallback
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
