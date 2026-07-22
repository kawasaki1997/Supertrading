import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StockManager } from "@/components/admin/StockManager";

export const dynamic = "force-dynamic";

// Force Vercel rebuild to regenerate Prisma client with order relation
export default async function StockDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      stockItems: {
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              code: true,
              createdAt: true,
            },
          },
        },
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
}
