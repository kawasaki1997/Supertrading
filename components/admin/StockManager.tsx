"use client";

import { useState } from "react";
import { Trash2, Package, CheckCircle2, XCircle, Clock } from "lucide-react";
import { deleteStockItemAction } from "@/app/admin/actions";

type StockItem = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  orderId: string | null;
};

type Product = {
  id: string;
  name: string;
  stockItems: StockItem[];
};

const STATUS_MAP = {
  AVAILABLE: { label: "Khả dụng", icon: Package, color: "text-emerald-soft" },
  SOLD: { label: "Đã bán", icon: CheckCircle2, color: "text-blue-soft" },
  RESERVED: { label: "Đang giữ", icon: Clock, color: "text-amber-soft" },
};

export function StockManager({ product }: { product: Product }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered =
    filter === "ALL"
      ? product.stockItems
      : product.stockItems.filter((i) => i.status === filter);

  const counts = {
    ALL: product.stockItems.length,
    AVAILABLE: product.stockItems.filter((i) => i.status === "AVAILABLE").length,
    SOLD: product.stockItems.filter((i) => i.status === "SOLD").length,
    RESERVED: product.stockItems.filter((i) => i.status === "RESERVED").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(["ALL", "AVAILABLE", "SOLD", "RESERVED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === status
                ? "bg-gold-500/20 text-gold-300"
                : "text-muted hover:bg-ink-800/50 hover:text-parchment-dim"
            }`}
          >
            {status === "ALL" ? "Tất cả" : STATUS_MAP[status].label} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl glass p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted" />
          <p className="mt-3 text-sm text-muted">Không có items nào</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/10 bg-ink-800/40 text-left text-xs font-semibold text-parchment-dim">
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Nội dung</th>
                  <th className="px-4 py-3">Ngày nhập</th>
                  <th className="px-4 py-3">Đơn hàng</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/8">
                {filtered.map((item) => {
                  const statusInfo = STATUS_MAP[item.status as keyof typeof STATUS_MAP];
                  const Icon = statusInfo?.icon || Package;

                  return (
                    <tr key={item.id} className="hover:bg-ink-800/30">
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 text-sm ${statusInfo?.color}`}>
                          <Icon className="h-4 w-4" />
                          <span>{statusInfo?.label || item.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="max-w-xs truncate text-xs text-parchment-dim">
                          {item.content}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {item.orderId ? (
                          <span>#{item.orderId.slice(0, 8)}</span>
                        ) : (
                          <span className="text-muted/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === "AVAILABLE" && (
                          <form
                            action={deleteStockItemAction}
                            onSubmit={(e) => {
                              if (!confirm("Xóa item này khỏi kho?")) e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="itemId" value={item.id} />
                            <button
                              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-soft/70 transition-colors hover:bg-rose-soft/10 hover:text-rose-soft"
                              aria-label="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
