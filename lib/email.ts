/**
 * Gửi email đặt lại mật khẩu.
 * - Nếu có RESEND_API_KEY trong .env → gửi email thật qua Resend.
 * - Nếu chưa cấu hình (local/dev) → in link ra console server để test.
 */
export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Super Trading <onboarding@resend.dev>",
          to,
          subject: "Đặt lại mật khẩu — Super Trading",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
              <h2>Đặt lại mật khẩu</h2>
              <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản Super Trading.</p>
              <p>Bấm nút bên dưới để đặt mật khẩu mới (liên kết hết hạn sau 1 giờ):</p>
              <p><a href="${link}" style="background:#c8aa6e;color:#0a0a10;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Đặt lại mật khẩu</a></p>
              <p style="color:#888;font-size:12px">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            </div>`,
        }),
      });
      if (!res.ok) {
        console.error("[email] Resend trả lỗi:", res.status, await res.text());
      }
      return;
    } catch (e) {
      console.error("[email] Gửi Resend thất bại, fallback console:", e);
    }
  }

  // Dev fallback: in link ra console server.
  console.log(
    `\n──────────── PASSWORD RESET ────────────\n  Tới: ${to}\n  Link: ${link}\n  (Cấu hình RESEND_API_KEY trong .env để gửi email thật)\n────────────────────────────────────────\n`,
  );
}
