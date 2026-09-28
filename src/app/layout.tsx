import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Preloader } from "@/components/layout/Preloader";
import { PageTransitionProvider } from "@/components/providers/PageTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { commerce } from "@/lib/commerce";
import { site } from "@/lib/site";
import "./globals.css";

// Montserrat for UI and body, per the brand book. Cormorant for editorial
// display type — a companion to the wordmark's high-contrast serif.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "OCIA — Lifestyle Essentials", template: "%s — OCIA" },
  description: site.description,
  openGraph: {
    title: "OCIA — Lifestyle Essentials",
    description: site.description,
    siteName: "OCIA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
};

const introScript = `try{if(sessionStorage.getItem("ocia:intro")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introSeen="1"}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const collections = await commerce.getCollections();
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="grain">
        <SmoothScroll>
          <CartProvider>
            <PageTransitionProvider>
              <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
                Skip to content
              </a>
              <Preloader />
              <Header collections={collections} />
              <main id="main">{children}</main>
              <Footer />
              <CartDrawer />
              <Cursor />
            </PageTransitionProvider>
          </CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
