import { redirect } from "next/navigation";
import { getCurrentUserInfo } from "@/lib/auth/get-current-user";
import { LandingThemeProvider } from "@/components/landing/LandingThemeProvider";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { BrandImagery } from "@/components/landing/BrandImagery";
import { AppScreensShowcase } from "@/components/landing/AppScreensShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const dynamic = "force-dynamic";

// Landing page da design handoff (design_handoff_nsk_landing, 6 ago 2026):
// palette "Elegance" (teal/navy) scoped a .nsk-landing, toggle chiaro/scuro,
// switcher di lingua reale (next-intl, vedi i18n/request.ts) su 12 stringhe
// come da spec, scroll-reveal, 5 varianti di phone mockup. Sostituisce
// l'homepage precedente (gold/charcoal) — il resto del sito resta invariato.
// (6 ago 2026, giro successivo: bg-gold/text-gold rinominati in bg-teal/
// text-teal in TUTTA l'app — vedi tailwind.config.ts, il brand ora è teal
// ovunque, non solo qui.)
export default async function HomePage() {
  const user = await getCurrentUserInfo();
  if (user) redirect("/dashboard");

  return (
    <LandingThemeProvider>
      <LandingNav />
      <Hero />
      <Features />
      <BrandImagery />
      <AppScreensShowcase />
      <Testimonials />
      <FinalCTA />
      <LandingFooter />
    </LandingThemeProvider>
  );
}
