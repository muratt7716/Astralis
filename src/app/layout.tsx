import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Astralis | Astroloji & Burç Platformu",
  description: "Burçlarınızı keşfedin, günlük yorumlarınızı okuyun, doğum haritanızı hesaplayın. Yıldızların rehberliğinde hayatınıza ışık tutun.",
  keywords: "astroloji, burçlar, günlük burç yorumu, doğum haritası, burç uyumluluğu, gezegenler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Aref+Ruqaa+Ink:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070714] text-white font-sans min-h-screen antialiased">
        <Providers>
          <StarField />
          <Navbar />
          <main className="relative z-10 pt-16 min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
