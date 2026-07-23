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

    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-grad">
            Kho hàng — {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {product.stockItems.length} items tổng cộng
          </p>
        </div>

        <StockManager product={product} />
      </div>
    );
  } catch (error) {
    console.error('Stock page error:', error);
    throw error;
  }
}
