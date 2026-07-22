# Hướng dẫn tích hợp MoMo Payment Gateway

## 1. Đăng ký tài khoản MoMo Business

1. Truy cập https://business.momo.vn và đăng ký tài khoản doanh nghiệp
2. Hoàn tất KYC (giấy phép kinh doanh, CMND/CCCD người đại diện)
3. Sau khi được duyệt, truy cập https://developers.momo.vn

## 2. Tạo ứng dụng và lấy credentials

1. Đăng nhập vào https://developers.momo.vn
2. Vào **My Apps** → **Create New App**
3. Chọn loại app: **Payment Gateway**
4. Điền thông tin:
   - App Name: `Super Trading`
   - Website: `https://www.supertrading.store`
   - IPN URL: `https://www.supertrading.store/api/momo/ipn`
   - Return URL: `https://www.supertrading.store/nap-tien/momo/callback`
5. Sau khi tạo xong, lấy:
   - **Partner Code**
   - **Access Key**
   - **Secret Key**

## 3. Cấu hình biến môi trường

### Local (test mode)

Thêm vào `.env`:

```bash
MOMO_PARTNER_CODE="<partner_code_sandbox>"
MOMO_ACCESS_KEY="<access_key_sandbox>"
MOMO_SECRET_KEY="<secret_key_sandbox>"
```

Test endpoint sẽ tự động dùng: `https://test-payment.momo.vn/v2/gateway/api/create`

### Production

Set trên Vercel:

```bash
vercel env add MOMO_PARTNER_CODE
# Nhập partner code production

vercel env add MOMO_ACCESS_KEY
# Nhập access key production

vercel env add MOMO_SECRET_KEY
# Nhập secret key production
```

Production endpoint sẽ tự động dùng: `https://payment.momo.vn/v2/gateway/api/create`

## 4. Test luồng thanh toán

### Test trên sandbox (local)

1. Chạy dev server: `npm run dev`
2. Vào http://localhost:3100/nap-tien
3. Chọn phương thức **MoMo**
4. Nhập số tiền (ví dụ: $10)
5. Click **Tạo lệnh nạp**
6. Click **Thanh toán với MoMo**
7. Trên sandbox MoMo, dùng số điện thoại test: `0999999999`, OTP: `999999`
8. Xác nhận thanh toán
9. Hệ thống tự redirect về callback → IPN webhook cộng tiền → redirect về trang nạp tiền

### Test trên production

1. Deploy: `vercel --prod`
2. Đảm bảo đã set đủ 3 biến môi trường MoMo trên Vercel
3. Vào https://www.supertrading.store/nap-tien
4. Thực hiện luồng tương tự như trên
5. Dùng app MoMo thật để thanh toán (production mode)

## 5. Webhook IPN

MoMo sẽ gửi POST request đến `https://www.supertrading.store/api/momo/ipn` với body:

```json
{
  "partnerCode": "MOMO",
  "orderId": "DEP-ABC123",
  "requestId": "DEP-ABC123_1234567890",
  "amount": 250000,
  "orderInfo": "Nap tien DEP-ABC123",
  "orderType": "momo_wallet",
  "transId": 1234567890,
  "resultCode": 0,
  "message": "Successful.",
  "payType": "qr",
  "responseTime": 1234567890000,
  "extraData": "",
  "signature": "abcd1234..."
}
```

- `resultCode = 0` → thanh toán thành công
- Hệ thống verify signature, đối chiếu số tiền, cộng vào balance user

## 6. Các resultCode phổ biến

| resultCode | Ý nghĩa |
|------------|---------|
| 0 | Thành công |
| 9000 | Giao dịch đang xử lý |
| 1000 | User hủy thanh toán |
| 1001 | Giao dịch thất bại (lỗi từ MoMo) |
| 1006 | User từ chối thanh toán |

## 7. Lưu ý bảo mật

- **KHÔNG commit** file `.env` lên git
- **Secret Key** phải giữ bí mật tuyệt đối
- IPN endpoint phải verify signature trước khi cộng tiền
- Kiểm tra `amount` khớp với `deposit.amountUsd` quy đổi VND
- Không cộng tiền 2 lần cho cùng 1 `transId`

## 8. Tài liệu tham khảo

- API Docs: https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/
- Sandbox: https://developers.momo.vn/v3/docs/payment/getting-started/test-credentials/
- Dashboard: https://business.momo.vn
