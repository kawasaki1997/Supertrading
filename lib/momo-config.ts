export const MOMO_CONFIG = {
  PARTNER_CODE: process.env.MOMO_PARTNER_CODE || "",
  ACCESS_KEY: process.env.MOMO_ACCESS_KEY || "",
  SECRET_KEY: process.env.MOMO_SECRET_KEY || "",
  ENDPOINT:
    process.env.NODE_ENV === "production"
      ? "https://payment.momo.vn/v2/gateway/api/create"
      : "https://test-payment.momo.vn/v2/gateway/api/create",
  REDIRECT_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/nap-tien/momo/callback`,
  IPN_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/momo/ipn`,
  REQUEST_TYPE: "payWithMethod",
};
