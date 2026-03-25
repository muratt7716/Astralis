import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gezegenler & Astroloji Bilgileri | Astralis",
  description: "Gezegenlerin astrolojik anlamları, etkileri ve burçlar üzerindeki rolleri.",
};

export default function GezegenlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
