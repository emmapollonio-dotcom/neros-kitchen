import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { rtlLocales } from "@/i18n/locales";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as (typeof rtlLocales)[number]) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="font-body">
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
