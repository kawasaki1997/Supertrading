import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StockManager } from "@/components/admin/StockManager";

export const dynamic = "force-dynamic";

// Force Vercel rebuild to regenerate Prisma client with order relation
export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockItems: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      notFound();
    }

    const calculatedStock = product.stockItems.reduce((sum, item) => sum + item.quantity, 0);
    const stockMismatch = product.stock !== calculatedStock;

    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-grad">
            Kho hàng — {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {product.stockItems.length} items tổng cộng
          </p>
          {stockMismatch && (
            <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                ⚠️ Stock không khớp: Product.stock = {product.stock}, tính từ StockItem = {calculatedStock}
              </p>
            </div>
          )}
        </div>

        <StockManager product={product} calculatedStock={calculatedStock} />
      </div>
    );
  } catch (error) {
    console.error('Stock page error:', error);
    throw error;
  }
}
