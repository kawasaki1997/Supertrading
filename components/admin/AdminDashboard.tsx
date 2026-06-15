"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  FolderTree,
  ImageIcon,
  Boxes,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  addStockAction,
} from "@/app/admin/actions";

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  sold: number;
  badge: string | null;
  image: string | null;
  order: number;
  active: boolean;
  categoryId: string;
  available: number;
  deliveryType: string;
};

type AdminCategory = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  order: number;
  products: AdminProduct[];
};

const BADGES = ["", "HOT", "NEW", "-50%", "LIMITED"];

const inputCls =
  "h-10 w-full rounded-lg border border-gold-500/15 bg-ink-800/70 px-3 text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40";
const labelCls = "mb-1 block text-xs font-semibold text-parchment-dim";

export function AdminDashboard({ categories }: { categories: AdminCategory[] }) {
  const [productModal, setProductModal] = useState<{
    open: boolean;
    product: AdminProduct | null;
  }>({ open: false, product: null });
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    category: AdminCategory | null;
  }>({ open: false, category: null });
  const [stockModal, setStockModal] = useState<{
    open: boolean;
    product: AdminProduct | null;
  }>({ open: false, product: null });

  const totalProducts = categories.reduce((s, c) => s + c.products.length, 0);

  return (
    <div className="space-y-10">
      <AdminToast />

      {/* Page heading */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
          Bảng điều khiển
        </h1>
        <p className="mt-1 text-sm text-muted">
          {categories.length} danh mục · {totalProducts} sản phẩm
        </p>
      </div>

      {/* ---------- Products ---------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
            <Package className="h-5 w-5 text-gold-400" /> Sản phẩm
          </h2>
          <button
            onClick={() => setProductModal({ open: true, product: null })}
            disabled={categories.length === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-3.5 py-2 text-xs font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>

        {categories.length === 0 && (
          <p className="rounded-xl glass p-4 text-sm text-muted">
            Hãy tạo một danh mục trước, rồi thêm sản phẩm vào đó.
          </p>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="overflow-hidden rounded-2xl glass">
            <div className="flex items-center justify-between border-b border-gold-500/10 px-4 py-3">
              <span className="font-serif text-sm font-semibold text-parchment">
                {cat.title}
                <span className="ml-2 text-xs text-muted">
                  ({cat.products.length})
                </span>
              </span>
            </div>
            {cat.products.length === 0 ? (
              <p className="px-4 py-5 text-xs text-muted">Chưa có sản phẩm.</p>
            ) : (
              <ul className="divide-y divide-gold-500/8">
                {cat.products.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-800/40"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-800 ring-1 ring-gold-500/15">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-parchment">
                        {p.name}
                        {p.badge && (
                          <span className="rounded bg-gold-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold-300">
                            {p.badge}
                          </span>
                        )}
                        {!p.active && (
                          <span className="rounded bg-ink-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted">
                            Ẩn
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Còn {p.stock} · Đã bán {p.sold} ·{" "}
                        {p.deliveryType === "MANUAL" ? (
                          <span className="text-royal-300">Giao tay</span>
                        ) : (
                          <span className={p.available > 0 ? "text-emerald-soft" : "text-rose-soft"}>
                            Kho: {p.available}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {p.oldPrice && (
                        <span className="mr-1 text-xs text-muted line-through">
                          ${p.oldPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="font-display text-sm font-bold text-gold-grad">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {p.deliveryType !== "MANUAL" && (
                        <button
                          onClick={() => setStockModal({ open: true, product: p })}
                          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold text-gold-300 transition-colors hover:bg-gold-500/10"
                          aria-label="Kho hàng"
                          title="Nhập kho"
                        >
                          <Boxes className="h-4 w-4" /> Kho
                        </button>
                      )}
                      <button
                        onClick={() => setProductModal({ open: true, product: p })}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-parchment-dim transition-colors hover:bg-gold-500/10 hover:text-gold-300"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <form
                        action={deleteProduct}
                        onSubmit={(e) => {
                          if (!confirm(`Xóa sản phẩm "${p.name}"?`)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-rose-soft/70 transition-colors hover:bg-rose-soft/10 hover:text-rose-soft"
                          aria-label="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* ---------- Categories ---------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-parchment">
            <FolderTree className="h-5 w-5 text-gold-400" /> Danh mục
          </h2>
          <button
            onClick={() => setCategoryModal({ open: true, category: null })}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gold-500/25 bg-gold-500/10 px-3.5 py-2 text-xs font-bold text-gold-300 transition-colors hover:bg-gold-500/20"
          >
            <Plus className="h-4 w-4" /> Thêm danh mục
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-start justify-between gap-3 rounded-2xl glass p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-serif text-sm font-semibold text-parchment">
                  {cat.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">{cat.subtitle}</p>
                <p className="mt-1 text-[11px] text-muted">
                  /{cat.slug} · {cat.products.length} sản phẩm
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setCategoryModal({ open: true, category: cat })}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-parchment-dim transition-colors hover:bg-gold-500/10 hover:text-gold-300"
                  aria-label="Sửa"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <form
                  action={deleteCategory}
                  onSubmit={(e) => {
                    if (
                      !confirm(
                        `Xóa danh mục "${cat.title}" và TẤT CẢ sản phẩm bên trong?`,
                      )
                    )
                      e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={cat.id} />
                  <button
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-rose-soft/70 transition-colors hover:bg-rose-soft/10 hover:text-rose-soft"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Product modal ---------- */}
      {productModal.open && (
        <Modal
          title={productModal.product ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          onClose={() => setProductModal({ open: false, product: null })}
        >
          <form action={saveProduct} className="space-y-4">
            {productModal.product && (
              <input type="hidden" name="id" value={productModal.product.id} />
            )}
            <div>
              <label className={labelCls}>Tên sản phẩm *</label>
              <input
                name="name"
                required
                defaultValue={productModal.product?.name ?? ""}
                className={inputCls}
                placeholder="VD: God Human"
              />
            </div>
            <div>
              <label className={labelCls}>Danh mục *</label>
              <select
                name="categoryId"
                required
                defaultValue={productModal.product?.categoryId ?? categories[0]?.id}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-800">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Giá ($) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={productModal.product?.price ?? ""}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Giá gốc ($)</label>
                <input
                  name="oldPrice"
                  type="number"
                  step="0.01"
                  defaultValue={productModal.product?.oldPrice ?? ""}
                  className={inputCls}
                  placeholder="(để gạch giảm giá)"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Tồn kho</label>
                <input
                  name="stock"
                  type="number"
                  defaultValue={productModal.product?.stock ?? 0}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Đã bán</label>
                <input
                  name="sold"
                  type="number"
                  defaultValue={productModal.product?.sold ?? 0}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Thứ tự</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={productModal.product?.order ?? 0}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nhãn</label>
                <select
                  name="badge"
                  defaultValue={productModal.product?.badge ?? ""}
                  className={inputCls}
                >
                  {BADGES.map((b) => (
                    <option key={b} value={b} className="bg-ink-800">
                      {b === "" ? "(không có)" : b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Loại giao hàng</label>
                <select
                  name="deliveryType"
                  defaultValue={productModal.product?.deliveryType ?? "AUTO"}
                  className={inputCls}
                >
                  <option value="AUTO" className="bg-ink-800">Tự động (tài khoản/kho)</option>
                  <option value="MANUAL" className="bg-ink-800">Thủ công (vật phẩm in-game)</option>
                </select>
              </div>
            </div>
            <p className="-mt-2 text-[11px] text-muted">
              <b className="text-parchment-dim">Tự động:</b> giao ngay dữ liệu từ kho khi khách mua. •{" "}
              <b className="text-parchment-dim">Thủ công:</b> khách nhập nick game, bạn giao tay rồi bấm
              &quot;Đã giao&quot; trong mục Đơn giao tay.
            </p>
            <div>
              <label className={labelCls}>Ảnh sản phẩm</label>
              {productModal.product?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productModal.product.image}
                  alt=""
                  className="mb-2 h-20 w-20 rounded-lg object-cover ring-1 ring-gold-500/15"
                />
              )}
              <input
                name="image"
                type="file"
                accept="image/*"
                className="block w-full text-xs text-parchment-dim file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gold-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold-300"
              />
              <p className="mt-1 text-[11px] text-muted">
                Bỏ trống nếu không đổi ảnh.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-parchment-dim">
              <input
                type="checkbox"
                name="active"
                defaultChecked={productModal.product?.active ?? true}
                className="h-4 w-4 accent-gold-500"
              />
              Hiển thị trên website
            </label>
            <ModalActions />
          </form>
        </Modal>
      )}

      {/* ---------- Category modal ---------- */}
      {categoryModal.open && (
        <Modal
          title={categoryModal.category ? "Sửa danh mục" : "Thêm danh mục"}
          onClose={() => setCategoryModal({ open: false, category: null })}
        >
          <form action={saveCategory} className="space-y-4">
            {categoryModal.category && (
              <input type="hidden" name="id" value={categoryModal.category.id} />
            )}
            <div>
              <label className={labelCls}>Tên danh mục *</label>
              <input
                name="title"
                required
                defaultValue={categoryModal.category?.title ?? ""}
                className={inputCls}
                placeholder="VD: Blox Fruits — Fruit Inventory"
              />
            </div>
            <div>
              <label className={labelCls}>Mô tả ngắn</label>
              <input
                name="subtitle"
                defaultValue={categoryModal.category?.subtitle ?? ""}
                className={inputCls}
                placeholder="VD: Giao ngay trong 1 phút"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Slug (để trống = tự tạo)</label>
                <input
                  name="slug"
                  defaultValue={categoryModal.category?.slug ?? ""}
                  className={inputCls}
                  placeholder="blox-fruits"
                />
              </div>
              <div>
                <label className={labelCls}>Thứ tự</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={categoryModal.category?.order ?? 0}
                  className={inputCls}
                />
              </div>
            </div>
            <ModalActions />
          </form>
        </Modal>
      )}

      {/* ---------- Stock (inventory) modal ---------- */}
      {stockModal.open && stockModal.product && (
        <Modal
          title={`Nhập kho — ${stockModal.product.name}`}
          onClose={() => setStockModal({ open: false, product: null })}
        >
          <form action={addStockAction} className="space-y-4">
            <input type="hidden" name="productId" value={stockModal.product.id} />
            <div className="rounded-lg bg-ink-800/60 p-3 text-xs text-parchment-dim ring-1 ring-gold-500/12">
              Đang có <b className="text-emerald-soft">{stockModal.product.available}</b> dữ liệu
              khả dụng trong kho. Mỗi <b className="text-parchment">dòng</b> là 1 đơn vị sẽ giao
              cho 1 khách (vd: <span className="font-mono">user:pass | mã | thông tin</span>).
            </div>
            <div>
              <label className={labelCls}>Dán dữ liệu (mỗi dòng 1 tài khoản/vật phẩm)</label>
              <textarea
                name="content"
                rows={8}
                required
                placeholder={"taikhoan1:matkhau1\ntaikhoan2:matkhau2\nMÃ-CODE-XXXX"}
                className="w-full rounded-lg border border-gold-500/15 bg-ink-800/70 p-3 font-mono text-sm text-parchment placeholder:text-muted outline-none transition-colors focus:border-gold-500/40"
              />
              <p className="mt-1 text-[11px] text-muted">
                Số dòng nhập vào sẽ tự cộng vào tồn kho hiển thị.
              </p>
            </div>
            <ModalActions />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl glass-strong p-6 ring-gold">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-parchment">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-ink-700 hover:text-parchment"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions() {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Đang lưu…" : "Lưu"}
      </button>
    </div>
  );
}

function AdminToast() {
  const sp = useSearchParams();
  const ok = sp.get("ok");
  const error = sp.get("error");
  if (!ok && !error) return null;

  const okMsg: Record<string, string> = {
    product: "Đã lưu sản phẩm.",
    category: "Đã lưu danh mục.",
    stock: "Đã nhập kho.",
    deleted: "Đã xóa.",
  };
  const errMsg: Record<string, string> = {
    save: "Lưu thất bại — kết nối chập chờn. Vui lòng bấm Lưu lại lần nữa.",
    missing: "Thiếu thông tin bắt buộc (tên / danh mục).",
  };

  const isErr = !!error;
  const text = isErr ? (errMsg[error!] ?? "Có lỗi xảy ra.") : (okMsg[ok!] ?? "Thành công.");

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
        isErr
          ? "bg-rose-soft/10 text-rose-soft ring-rose-soft/25"
          : "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25"
      }`}
    >
      {isErr ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {text}
    </div>
  );
}
