import { zodiacSigns } from "@/data/zodiac";
import Link from "next/link";
import ClientHoroscopeCard from "@/components/ClientHoroscopeCard";
import type { Metadata } from "next";

const periodLabels: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
  yearly: "Yıllık",
};

export async function generateStaticParams() {
  return [
    { period: "daily" },
    { period: "weekly" },
    { period: "monthly" },
    { period: "yearly" },
  ];
}

const periodKeywords: Record<string, string> = {
  daily: "günlük burç yorumu, bugün burç, günlük astroloji",
  weekly: "haftalık burç yorumu, bu hafta burçlar, haftalık astroloji",
  monthly: "aylık burç yorumu, ay burç analizi, aylık astroloji",
  yearly: "yıllık burç yorumu, 2026 burç tahminleri, yıllık astroloji",
};

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }): Promise<Metadata> {
  const { period } = await params;
  const label = periodLabels[period] || "Günlük";
  const canonicalUrl = `https://www.astralislab.com/yorumlar/${period}`;
  return {
    title: `${label} Burç Yorumları — Tüm 12 Burç | Astralis`,
    description: `${label} burç yorumları: Koç, Boğa, İkizler, Yengeç ve tüm 12 burç için ${label.toLowerCase()} astroloji analizi. Astralis yapay zeka destekli kozmik rehberlik platformu.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${label} Burç Yorumları | Astralis`,
      description: `Tüm burçlar için ${label.toLowerCase()} astroloji analizi ve rehberlik.`,
      url: canonicalUrl,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function PeriodYorumlarPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: periodParam } = await params;
  const period = periodParam as "daily" | "weekly" | "monthly" | "yearly";
  const label = periodLabels[period] || "Günlük";

  const allPeriods = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-4 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{label} Yorumlar</span>
          </h1>
        </div>
      </section>

      {/* Period Tabs */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto flex justify-center gap-2 flex-wrap">
          {allPeriods.map((p) => (
            <Link
              key={p}
              href={`/yorumlar/${p}`}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                p === period
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              {periodLabels[p]}
            </Link>
          ))}
        </div>
      </section>

      {/* All Signs */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {zodiacSigns.map((sign) => {
            return (
              <div key={sign.id} id={sign.id} className="glass-card p-6 md:p-8 fade-in-up mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{sign.symbol}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{sign.name}</h2>
                    <p className="text-gray-500 text-sm">{sign.dateRange}</p>
                  </div>
                </div>

                <ClientHoroscopeCard signId={sign.id} period={period} />

                <div className="mt-6 flex justify-end">
                  <Link href={`/burclar/${sign.id}`} className="text-purple-400 text-sm hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg">
                    Detaylı bilgi →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
