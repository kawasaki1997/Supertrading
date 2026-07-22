# Hướng dẫn tích hợp PayOS

PayOS là cổng thanh toán cho phép nhận tiền qua **MoMo**, **ZaloPay**, **VietQR**, và **thẻ ngân hàng** thông qua một API duy nhất.

## Ưu điểm

- ✅ **Không cần giấy phép kinh doanh** — phù hợp cá nhân/startup
- ✅ **Đa kênh thanh toán** — MoMo, ZaloPay, VietQR, thẻ ATM/Credit
- ✅ **Tích hợp đơn giản** — 1 API cho tất cả phương thức
- ✅ **Tự động cộng tiền** — webhook thông báo khi thanh toán thành công
- ✅ **Phí thấp** — ~1.8-2.5% tùy gói

## Bước 1: Đăng ký tài khoản PayOS

1. Truy cập https://payos.vn
2. Đăng ký tài khoản (cá nhân hoặc doanh nghiệp)
3. Xác minh email và hoàn tất KYC cơ bản

## Bước 2: Tạo ứng dụng và lấy credentials

1. Đăng nhập vào https://my.payos.vn
2. Vào **Developer** → **API Keys**
3. Tạo API Key mới, lưu lại:
   - **Client ID**
   - **API Key**
   - **Checksum Key**

## Bước 3: Cấu hình biến môi trường

### Môi trường development (local)

Thêm vào file `.env.local`:

```bash
# PayOS Configuration
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here
```

### Môi trường production (Vercel)

Set biến môi trường trên Vercel:

```bash
vercel env add PAYOS_CLIENT_ID
vercel env add PAYOS_API_KEY
vercel env add PAYOS_CHECKSUM_KEY
```

Hoặc qua Vercel Dashboard:
1. Vào project → **Settings** → **Environment Variables**
2. Thêm 3 biến trên với giá trị tương ứng
3. Apply cho **Production**, **Preview**, và **Development**

## Bước 4: Cấu hình webhook URL trên PayOS

1. Vào https://my.payos.vn
2. Vào **Developer** → **Webhooks**
3. Thêm webhook URL:
   ```
   https://your-domain.com/api/payos/webhook
   ```
4. Chọn events: **payment.success**
5. Lưu lại

## Bước 5: Test thanh toán

### Test trên sandbox (nếu có)

PayOS cung cấp môi trường sandbox để test. Kiểm tra docs tại https://payos.vn/docs

### Test trên production

1. Deploy code lên Vercel
2. Tạo lệnh nạp tiền với phương thức **PayOS**
3. Click **"Thanh toán ngay"**
4. Chọn phương thức thanh toán (MoMo/ZaloPay/VietQR/thẻ)
5. Hoàn tất thanh toán
6. Kiểm tra webhook log và số dư tài khoản

## Luồng hoạt động

```
User chọn PayOS
    ↓
Tạo deposit order (method=PAYOS)
    ↓
Click "Thanh toán ngay"
    ↓
POST /api/payos/create
    ↓
Redirect đến PayOS checkout page
    ↓
User chọn MoMo/ZaloPay/VietQR/thẻ
    ↓
Hoàn tất thanh toán
    ↓
PayOS gửi webhook → /api/payos/webhook
    ↓
Verify signature → cộng tiền tự động
    ↓
Redirect về /nap-tien/payos/return?code=00
    ↓
Hiển thị thành công → về trang nạp tiền
```

## File liên quan

- [lib/payos-config.ts](../lib/payos-config.ts) — cấu hình PayOS
- [lib/payos.ts](../lib/payos.ts) — helper functions
- [app/api/payos/create/route.ts](../app/api/payos/create/route.ts) — API tạo payment
- [app/api/payos/webhook/route.ts](../app/api/payos/webhook/route.ts) — webhook nhận thông báo
- [app/nap-tien/payos/return/page.tsx](../app/nap-tien/payos/return/page.tsx) — trang return sau thanh toán
- [app/nap-tien/payos/cancel/page.tsx](../app/nap-tien/payos/cancel/page.tsx) — trang cancel
- [components/deposit/PayosButton.tsx](../components/deposit/PayosButton.tsx) — button thanh toán

## Troubleshooting

### Webhook không hoạt động

1. Kiểm tra webhook URL đã đúng chưa (phải có https://)
2. Check log server: `vercel logs`
3. Verify signature đúng chưa (checksum key)

### Thanh toán thành công nhưng không cộng tiền

1. Check webhook log có nhận được không
2. Verify amount khớp không
3. Check status trong DB: `status=COMPLETED`

### Invalid signature error

1. Verify `PAYOS_CHECKSUM_KEY` đã đúng chưa
2. Check format data truyền vào signature (sort theo alphabet)

## Hỗ trợ

- Docs: https://payos.vn/docs
- Support: support@payos.vn
- Facebook: https://facebook.com/payos.vn
