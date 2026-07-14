import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Ảnh sản phẩm upload qua Server Action — mặc định Next chặn body > 1MB.
    // Nâng lên 10MB để lưu sản phẩm kèm ảnh chụp (thường 1-5MB) không bị lỗi 500.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
