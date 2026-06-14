import { cookies } from "next/headers";

export type Locale = "vi" | "en";
export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "vi";

type Dict = Record<string, string>;

const vi: Dict = {
  // common
  "common.buyNow": "Mua ngay",
  "common.addToCart": "Thêm vào giỏ",
  "common.processing": "Đang xử lý",
  "common.bought": "Đã mua",
  "common.added": "Đã thêm",
  "common.save": "Lưu",
  "common.viewAll": "Xem tất cả",
  "common.back": "Quay lại",
  "common.balance": "Số dư",
  "common.outOfStock": "Hết hàng",
  "common.soldCount": "Đã bán",
  "common.inStock": "Còn",
  "err.balance": "Số dư không đủ — hãy nạp tiền.",
  "err.stock": "Sản phẩm đã hết hàng.",
  "err.unavailable": "Sản phẩm không khả dụng.",
  "err.generic": "Có lỗi, vui lòng thử lại.",
  "product.confirmBuy": "Xác nhận mua? Số dư của bạn sẽ bị trừ.",

  // nav
  "nav.searchPlaceholder": "Tìm vật phẩm, tài khoản, dịch vụ…",
  "nav.shop": "Cửa hàng",
  "nav.deposit": "Nạp tiền",
  "nav.orders": "Đơn hàng",
  "nav.complaints": "Khiếu nại",
  "nav.transactions": "Giao dịch",
  "nav.notifications": "Thông báo",
  "nav.support": "Chat hỗ trợ",
  "nav.guide": "Hướng dẫn",
  "nav.login": "Đăng nhập",
  "nav.register": "Đăng ký",
  "nav.profile": "Hồ sơ",
  "nav.logout": "Đăng xuất",
  "role.customer": "Khách hàng",
  "role.admin": "Quản trị",

  // hero
  "hero.badge": "Roblox Marketplace",
  "hero.tagline": "Vật phẩm & tài khoản game đẳng cấp — giao ngay, an toàn tuyệt đối, giá tốt nhất thị trường.",
  "hero.joinDiscord": "Tham gia Discord",
  "trust.bestPrice": "Giá tốt nhất",
  "trust.instant": "Giao tức thì",
  "trust.safe": "An toàn 100%",
  "trust.support": "Hỗ trợ 24/7",

  // shop toolbar
  "shop.title": "Cửa hàng",
  "shop.productsOnSale": "sản phẩm đang bán",
  "shop.all": "Tất cả",
  "shop.filter": "Bộ lọc",
  "shop.noProducts": "Chưa có sản phẩm trong danh mục này.",

  // stats
  "stats.completed": "Đơn hoàn tất",
  "stats.happy": "Khách hài lòng",
  "stats.reviews": "Đánh giá 5 sao",
  "stats.avgDelivery": "Giao trung bình",
  "stats.avgValue": "47 giây",

  // footer
  "footer.tagline": "Sàn giao dịch vật phẩm & tài khoản game uy tín hàng đầu. Giao dịch an toàn, bảo hành minh bạch.",
  "footer.colShop": "Cửa hàng",
  "footer.colSupport": "Hỗ trợ",
  "footer.colCommunity": "Cộng đồng",
  "footer.rights": "Đã đăng ký bản quyền.",

  // auth
  "auth.createAccount": "Tạo tài khoản",
  "auth.registerSub": "Đăng ký để mua hàng, nạp tiền và theo dõi đơn",
  "auth.name": "Tên hiển thị",
  "auth.email": "Email",
  "auth.password": "Mật khẩu",
  "auth.passwordMin": "Mật khẩu (tối thiểu 6 ký tự)",
  "auth.confirm": "Nhập lại mật khẩu",
  "auth.register": "Đăng ký",
  "auth.haveAccount": "Đã có tài khoản?",
  "auth.login": "Đăng nhập",
  "auth.loginSub": "Chào mừng trở lại Super Trading",
  "auth.noAccount": "Chưa có tài khoản?",
  "auth.registerNow": "Đăng ký ngay",
  "auth.forgot": "Quên mật khẩu?",
  "auth.resetSuccess": "Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.",

  // cart
  "cart.title": "Giỏ hàng",
  "cart.empty": "Giỏ hàng của bạn đang trống.",
  "cart.continue": "Tiếp tục mua sắm",
  "cart.summary": "Tổng kết",
  "cart.subtotal": "Tạm tính",
  "cart.total": "Thanh toán",
  "cart.checkout": "Thanh toán",
  "cart.notEnough": "Số dư không đủ.",
  "cart.topup": "Nạp thêm tiền",

  // deposit
  "deposit.title": "Nạp tiền",
  "deposit.currentBalance": "Số dư hiện tại",

  // orders
  "orders.title": "Đơn hàng của tôi",
  "orders.totalOrders": "Tổng đơn",
  "orders.spent": "Đã chi",
  "orders.empty": "Bạn chưa có đơn hàng nào.",
  "orders.shopNow": "Mua sắm ngay",
  "orders.code": "Mã đơn",
  "orders.product": "Sản phẩm",
  "orders.amount": "Số tiền",
  "orders.status": "Trạng thái",
  "orders.time": "Thời gian",
  "orders.done": "Hoàn tất",
  "orders.view": "Xem",

  // profile
  "profile.title": "Hồ sơ của tôi",
  "profile.sub": "Quản lý thông tin & bảo mật tài khoản",
};

const en: Dict = {
  "common.buyNow": "Buy now",
  "common.addToCart": "Add to cart",
  "common.processing": "Processing",
  "common.bought": "Purchased",
  "common.added": "Added",
  "common.save": "Save",
  "common.viewAll": "View all",
  "common.back": "Back",
  "common.balance": "Balance",
  "common.outOfStock": "Out of stock",
  "common.soldCount": "Sold",
  "common.inStock": "In stock",
  "err.balance": "Insufficient balance — please top up.",
  "err.stock": "This item is out of stock.",
  "err.unavailable": "This item is unavailable.",
  "err.generic": "Something went wrong, please try again.",
  "product.confirmBuy": "Confirm purchase? Your balance will be charged.",

  "nav.searchPlaceholder": "Search items, accounts, services…",
  "nav.shop": "Shop",
  "nav.deposit": "Deposit",
  "nav.orders": "Orders",
  "nav.complaints": "Complaints",
  "nav.transactions": "Transactions",
  "nav.notifications": "Notifications",
  "nav.support": "Support",
  "nav.guide": "Guide",
  "nav.login": "Log in",
  "nav.register": "Sign up",
  "nav.profile": "Profile",
  "nav.logout": "Log out",
  "role.customer": "Customer",
  "role.admin": "Admin",

  "hero.badge": "Roblox Marketplace",
  "hero.tagline": "Premium game items & accounts — instant delivery, 100% safe, best prices on the market.",
  "hero.joinDiscord": "Join Discord",
  "trust.bestPrice": "Best price",
  "trust.instant": "Instant delivery",
  "trust.safe": "100% safe",
  "trust.support": "24/7 support",

  "shop.title": "Shop",
  "shop.productsOnSale": "products on sale",
  "shop.all": "All",
  "shop.filter": "Filter",
  "shop.noProducts": "No products in this category yet.",

  "stats.completed": "Completed orders",
  "stats.happy": "Happy customers",
  "stats.reviews": "5-star reviews",
  "stats.avgDelivery": "Avg. delivery",
  "stats.avgValue": "47 sec",

  "footer.tagline": "A leading, trusted marketplace for game items & accounts. Safe transactions, transparent warranty.",
  "footer.colShop": "Shop",
  "footer.colSupport": "Support",
  "footer.colCommunity": "Community",
  "footer.rights": "All rights reserved.",

  "auth.createAccount": "Create account",
  "auth.registerSub": "Sign up to buy, top up and track orders",
  "auth.name": "Display name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordMin": "Password (min 6 characters)",
  "auth.confirm": "Confirm password",
  "auth.register": "Sign up",
  "auth.haveAccount": "Already have an account?",
  "auth.login": "Log in",
  "auth.loginSub": "Welcome back to Super Trading",
  "auth.noAccount": "No account yet?",
  "auth.registerNow": "Sign up now",
  "auth.forgot": "Forgot password?",
  "auth.resetSuccess": "Password reset successful. Please log in with your new password.",

  "cart.title": "Cart",
  "cart.empty": "Your cart is empty.",
  "cart.continue": "Continue shopping",
  "cart.summary": "Summary",
  "cart.subtotal": "Subtotal",
  "cart.total": "Total",
  "cart.checkout": "Checkout",
  "cart.notEnough": "Insufficient balance.",
  "cart.topup": "Top up",

  "deposit.title": "Deposit",
  "deposit.currentBalance": "Current balance",

  "orders.title": "My orders",
  "orders.totalOrders": "Total orders",
  "orders.spent": "Spent",
  "orders.empty": "You have no orders yet.",
  "orders.shopNow": "Shop now",
  "orders.code": "Order code",
  "orders.product": "Product",
  "orders.amount": "Amount",
  "orders.status": "Status",
  "orders.time": "Time",
  "orders.done": "Completed",
  "orders.view": "View",

  "profile.title": "My profile",
  "profile.sub": "Manage your account info & security",
};

export const messages: Record<Locale, Dict> = { vi, en };

export function getDict(locale: Locale): Dict {
  return messages[locale] ?? messages[DEFAULT_LOCALE];
}

/** Server-side: read current locale from cookie. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return v === "en" ? "en" : "vi";
}

/** Server-side translator. */
export async function getT(): Promise<(key: string) => string> {
  const dict = getDict(await getLocale());
  return (key: string) => dict[key] ?? key;
}
