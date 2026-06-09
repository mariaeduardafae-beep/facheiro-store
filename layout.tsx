import type { Metadata } from "next";
import "./globals.css";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Facheiro | Feitas para permanecer",
    template: "%s | Facheiro"
  },
  description: "Peças autorais brasileiras criadas para atravessar tendências e fazer parte da sua história.",
  openGraph: {
    title: "Facheiro",
    description: "Peças autorais brasileiras criadas para permanecer.",
    url: siteUrl,
    siteName: "Facheiro",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
