import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tüm Burçlar | Astralis",
  description: "12 burcun detaylı özellikleri, elementleri, yönetici gezegenleri ve kişilik analizleri.",
};

export default function BurclarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
