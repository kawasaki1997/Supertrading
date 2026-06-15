import { redirect } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thông báo — Super Trading" };

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-gold-grad">
        <Bell className="h-6 w-6 text-gold-400" /> {t("notif.title")}
      </h1>

      <div className="rounded-2xl glass p-12 text-center">
        <BellOff className="mx-auto mb-3 h-10 w-10 text-muted" />
        <p className="text-sm text-muted">{t("notif.empty")}</p>
      </div>
    </div>
  );
}
