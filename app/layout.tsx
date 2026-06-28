import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsappFab } from "@/components/whatsapp-fab";

const dinCondensed = localFont({
  src: [{ path: "../public/fonts/din-condensed-bold-maisfontes.93e1/din-condensed-bold.ttf", weight: "700", style: "normal" }],
  variable: "--font-din-condensed",
  display: "swap"
});

const dinMedium = localFont({
  src: [{ path: "../public/fonts/din-medium-maisfontes.ec3c/din-medium.otf", weight: "500", style: "normal" }],
  variable: "--font-din-medium",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Facheiro | Feitas para permanecer",
    template: "%s | Facheiro"
  },
  description: "PeÃ§as autorais brasileiras criadas para atravessar tendÃªncias e fazer parte da sua histÃ³ria.",
  openGraph: {
    title: "Facheiro",
    description: "PeÃ§as autorais brasileiras criadas para permanecer.",
    url: siteUrl,
    siteName: "Facheiro",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${dinCondensed.variable} ${dinMedium.variable}`}>
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <WhatsappFab />
        </CartProvider>
      </body>
    </html>
  );
}