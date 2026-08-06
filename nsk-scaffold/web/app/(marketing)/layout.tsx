import { headers } from "next/headers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // La homepage ("/") ha nav/footer propri — vedi components/landing/
  // LandingNav e LandingFooter, dal design handoff del 6 ago 2026 — quindi
  // salta SiteHeader/SiteFooter solo lì. x-pathname è impostato dal
  // middleware (vedi middleware.ts). Tutte le altre pagine di marketing
  // (pricing, privacy, termini, login, signup...) restano invariate.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-charcoal text-ivory">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
