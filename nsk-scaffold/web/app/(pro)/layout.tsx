import { AppNav } from "@/components/layout/AppNav";

export default function ProGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-shell text-shell-fg">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
