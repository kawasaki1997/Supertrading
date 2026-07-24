import { syncAllProductStockAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SyncStockPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Đồng bộ tồn kho</CardTitle>
          <CardDescription>
            Sync lại số lượng tồn kho (stock) cho tất cả sản phẩm từ bảng StockItem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <h3 className="font-medium text-amber-900 mb-2">⚠️ Cảnh báo</h3>
            <p className="text-sm text-amber-800">
              Thao tác này sẽ tính lại tồn kho cho tất cả sản phẩm bằng cách cộng tổng số lượng từ
              các StockItem tương ứng. Dữ liệu stock hiện tại sẽ bị ghi đè.
            </p>
          </div>

          <form action={syncAllProductStockAction}>
            <Button type="submit" className="w-full" size="lg">
              Đồng bộ tất cả sản phẩm
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Hệ thống sẽ:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Quét tất cả sản phẩm trong database</li>
              <li>Tính tổng số lượng từ bảng StockItem cho mỗi sản phẩm</li>
              <li>Cập nhật trường stock của Product</li>
              <li>Revalidate cache cho trang products và stock</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
