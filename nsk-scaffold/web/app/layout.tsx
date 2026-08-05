import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nero's Kitchen — L'ecosistema per chef e ristorazione",
  description:
    "Prenota chef privati, gestisci food cost, riduci gli sprechi e cresci con gli strumenti AI di Nero's Kitchen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="font-body">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
