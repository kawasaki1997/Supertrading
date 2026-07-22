# Super Trading - Game Account & Items Marketplace

Sàn giao dịch tài khoản và vật phẩm game với hệ thống nạp tiền đa kênh.

## Tính năng chính

### Khách hàng
- 🔐 Đăng ký/đăng nhập, quên mật khẩu
- 🛒 Cửa hàng theo danh mục, tìm kiếm, giỏ hàng
- 📦 Giao hàng **AUTO** (tài khoản/key) và **MANUAL** (vật phẩm in-game)
- 💰 Nạp tiền qua:
  - **USDT (BEP-20)** — tự động khớp on-chain
  - **Litecoin** — tự động khớp on-chain
  - **Chuyển khoản ngân hàng** — VietQR + webhook SePay
  - **MoMo** — Payment Gateway trực tiếp
  - **PayOS** — MoMo/ZaloPay/VietQR/thẻ qua một cổng thanh toán
- 📋 Quản lý đơn hàng, giao dịch, khiếu nại
- 🔔 Hệ thống thông báo realtime
- 💬 Chat hỗ trợ Tawk.to

### Admin
- 📊 Dashboard thống kê
- 🏪 Quản lý sản phẩm, danh mục, kho hàng
- ✅ Duyệt lệnh nạp tiền, giao hàng manual
- 🎫 Xử lý khiếu nại

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** Session-based (bcrypt + HTTP-only cookie)
- **Payments:** 
  - Crypto: BSC RPC (USDT), BlockCypher (LTC)
  - VN Banking: SePay webhook
  - E-wallets: MoMo Gateway, PayOS
- **Deployment:** Vercel

## Cài đặt

### 1. Clone repo

```bash
git clone <repo-url>
cd louk-store
npm install
```

### 2. Cấu hình biến môi trường

Tạo file `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Admin Auth
ADMIN_PASSWORD="your-strong-password"
AUTH_TOKEN="random-long-token"

# Crypto Deposit
DEPOSIT_USDT_BEP20="0x..."
DEPOSIT_LTC="L..."
LTC_USD_RATE="80"
BSC_RPC_URL="https://bsc-dataseed.bnbchain.org"

# Banking (SePay)
SEPAY_API_KEY="your-sepay-key"

# MoMo Gateway
MOMO_PARTNER_CODE="your-partner-code"
MOMO_ACCESS_KEY="your-access-key"
MOMO_SECRET_KEY="your-secret-key"

# PayOS
PAYOS_CLIENT_ID="your-client-id"
PAYOS_API_KEY="your-api-key"
PAYOS_CHECKSUM_KEY="your-checksum-key"

# Chat
NEXT_PUBLIC_TAWK_PROPERTY_ID="your-tawk-id"
NEXT_PUBLIC_TAWK_WIDGET_ID="your-widget-id"
```

### 3. Setup database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed data (optional)

```bash
npm run seed
```

### 5. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Hướng dẫn thanh toán

- **[MoMo Setup](docs/MOMO_SETUP.md)** — Tích hợp MoMo Payment Gateway
- **[PayOS Setup](docs/PAYOS_SETUP.md)** — Tích hợp PayOS (MoMo/ZaloPay/VietQR/thẻ)

## Deploy lên Vercel

1. Push code lên GitHub
2. Import project trên [Vercel](https://vercel.com)
3. Set environment variables (copy từ `.env.local`)
4. Deploy

```bash
vercel --prod
```

## Cấu trúc thư mục

```
louk-store/
├── app/                    # Next.js App Router
│   ├── (site)/            # Public pages
│   ├── admin/             # Admin pages
│   └── api/               # API endpoints
├── components/            # React components
├── lib/                   # Utilities & configs
├── prisma/               # Database schema
├── public/               # Static assets
└── docs/                 # Documentation
```

## License

MIT
