import { AppNav } from "@/components/layout/AppNav";

export default function ProGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-charcoal text-ivory">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
