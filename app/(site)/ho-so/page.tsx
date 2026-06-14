import { redirect } from "next/navigation";
import { Mail, Wallet, CalendarDays, ShieldCheck, User, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateProfileAction, changePasswordAction } from "@/lib/user-actions";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hồ sơ của tôi — Super Trading" };

const flashKey: Record<string, { ok?: boolean; key: string }> = {
  profile: { ok: true, key: "profile.okProfile" },
  password: { ok: true, key: "profile.okPassword" },
  name: { key: "profile.errName" },
  missing: { key: "profile.errMissing" },
  short: { key: "profile.errShort" },
  match: { key: "profile.errMatch" },
  current: { key: "profile.errCurrent" },
};

const inputCls =
  "h-11 w-full rounded-xl border border-gold-500/15 bg-ink-800/70 px-3.5 text-sm text-parchment placeholder:text-muted outline-none transition-all focus:border-gold-500/40 focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-gold-500)_15%,transparent)]";
const labelCls = "mb-1 block text-xs font-semibold text-parchment-dim";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-nhap");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/dang-nhap");

  const { ok, error } = await searchParams;
  const t = await getT();
  const flashDef = ok ? flashKey[ok] : error ? flashKey[error] : null;
  const flash = flashDef ? { ok: flashDef.ok, text: t(flashDef.key) } : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-gold-grad">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("profile.sub")}</p>
      </div>

      {flash && (
        <p
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
            flash.ok
              ? "bg-emerald-soft/10 text-emerald-soft ring-emerald-soft/25"
              : "bg-rose-soft/10 text-rose-soft ring-rose-soft/25"
          }`}
        >
          {flash.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {flash.text}
        </p>
      )}

      {/* Account overview */}
      <div className="flex items-center gap-4 rounded-2xl glass p-5">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-royal-500 text-2xl font-bold text-ink-950">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-parchment">{user.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
        </div>
        <div className="ml-auto hidden text-right sm:block">
          <p className="text-xs text-muted">{t("profile.balanceWallet")}</p>
          <p className="font-display text-2xl font-bold text-gold-grad">
            ${user.balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Wallet} label={t("common.balance")} value={`$${user.balance.toFixed(2)}`} />
        <Stat icon={ShieldCheck} label={t("profile.role")} value={user.role === "admin" ? t("role.admin") : t("role.customer")} />
        <Stat
          icon={CalendarDays}
          label={t("profile.joined")}
          value={new Intl.DateTimeFormat("vi-VN").format(user.createdAt)}
        />
        <Stat icon={User} label={t("profile.statusLabel")} value={t("profile.active")} />
      </div>

      {/* Edit profile */}
      <section className="rounded-2xl glass p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <User className="h-5 w-5 text-gold-400" /> {t("profile.personalInfo")}
        </h2>
        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label className={labelCls}>{t("profile.displayName")}</label>
            <input name="name" defaultValue={user.name} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("profile.emailLocked")}</label>
            <input value={user.email} disabled className={`${inputCls} opacity-60`} />
          </div>
          <div className="flex justify-end">
            <button className="cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500">
              {t("profile.saveChanges")}
            </button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl glass p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-parchment">
          <KeyRound className="h-5 w-5 text-gold-400" /> {t("profile.changePassword")}
        </h2>
        <form action={changePasswordAction} className="space-y-4">
          <div>
            <label className={labelCls}>{t("profile.currentPassword")}</label>
            <input name="current" type="password" required className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("profile.newPassword")}</label>
              <input name="next" type="password" required className={inputCls} placeholder={t("profile.newPasswordPh")} />
            </div>
            <div>
              <label className={labelCls}>{t("profile.confirmNew")}</label>
              <input name="confirm" type="password" required className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="cursor-pointer rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:from-gold-200 hover:to-gold-500">
              {t("profile.changePassword")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl glass px-4 py-3">
      <Icon className="h-4 w-4 text-gold-400" />
      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="truncate text-sm font-semibold text-parchment">{value}</p>
    </div>
  );
}
