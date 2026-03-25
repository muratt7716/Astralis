import { zodiacSigns, getZodiacById } from "@/data/zodiac";
import Link from "next/link";
import ClientHoroscopeCard from "@/components/ClientHoroscopeCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign: signId } = await params;
  const sign = getZodiacById(signId);
  if (!sign) return { title: "Burç Bulunamadı" };
  return {
    title: `${sign.name} Burcu | Astralis`,
    description: `${sign.name} burcu özellikleri, şanslı sayıları, taşları ve astrolojik rehberliği.`,
  };
}

export default async function ZodiacDetailPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: signId } = await params;
  const sign = getZodiacById(signId);

  if (!sign) notFound();

  const compatibleSigns = sign.compatibility
    .map(id => getZodiacById(id))
    .filter(Boolean);

  const elementColors: Record<string, string> = {
    "Ateş": "from-red-600/30 to-orange-600/30",
    "Toprak": "from-green-600/30 to-emerald-600/30",
    "Hava": "from-sky-600/30 to-cyan-600/30",
    "Su": "from-blue-600/30 to-indigo-600/30",
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Hero */}
      <section className={`pt-16 pb-12 px-4 bg-gradient-to-b ${elementColors[sign.element] || ""} to-transparent`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-4 float">{sign.symbol}</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{sign.name}</h1>
          <p className="text-xl text-gray-400 mb-4">{sign.dateRange}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {sign.elementEmoji} {sign.element}
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {sign.rulingPlanetEmoji} {sign.rulingPlanet}
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              🎯 {sign.quality}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Quick Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🎯 Hızlı Bilgiler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">Şanslı Sayılar</p>
              <p className="text-white font-bold text-lg">{sign.luckyNumbers.join(", ")}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">Şanslı Gün</p>
              <p className="text-white font-bold text-lg">{sign.luckyDay}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">Şanslı Renk</p>
              <p className="text-white font-bold text-lg">{sign.luckyColor}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">Kalite</p>
              <p className="text-white font-bold text-lg">{sign.quality}</p>
            </div>
          </div>
        </section>

        {/* Daily Horoscope */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">📖 Günlük Yorum</h2>
          <ClientHoroscopeCard signId={signId} period="daily" />
        </section>

        {/* Compatibility */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">💕 En Uyumlu Burçlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compatibleSigns.map((cs) => cs && (
              <Link key={cs.id} href={`/burclar/${cs.id}`}>
                <div className="glass-card p-4 text-center hover:scale-105 transition-all duration-300 hover:border-purple-500/40 group">
                  <span className="text-3xl mb-2 block group-hover:animate-bounce">{cs.symbol}</span>
                  <p className="text-white font-medium">{cs.name}</p>
                  <p className="text-gray-500 text-xs">{cs.dateRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/burclar" className="px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all">
            ← Tüm Burçlar
          </Link>
          <Link href="/uyumluluk" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Uyumluluk Testi →
          </Link>
        </div>
      </div>
    </div>
  );
}
