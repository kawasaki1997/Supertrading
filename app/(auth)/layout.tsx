import { Brand } from "@/components/brand/DragonLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-6">
        <Brand href="/" />
      </div>
      <div className="grid place-items-center px-4 pb-24 pt-2">{children}</div>
    </div>
  );
}
