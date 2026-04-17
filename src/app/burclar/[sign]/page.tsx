import { zodiacSigns, getZodiacById, type ZodiacSign } from "@/data/zodiac";
import Link from "next/link";
import ClientHoroscopeCard from "@/components/ClientHoroscopeCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { translations, type SupportedLanguage } from "@/lib/i18n-shared";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";

// Helper for server-side translation with interpolation
const getT = (lang: SupportedLanguage) => (key: string, params?: Record<string, string>) => {
  let val = translations[lang][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replaceAll(`{${k}}`, v);
    });
  }
  return val;
};

const formatZodiacDate = (sign: ZodiacSign, t: ReturnType<typeof getT>) => {
  const format = (m: number, d: number) => {
    const monthName = t(`astrology.month.${m}`);
    return t("astrology.date_format", { day: d.toString(), month: monthName });
  };
  return `${format(sign.startDate.month, sign.startDate.day)} - ${format(sign.endDate.month, sign.endDate.day)}`;
};

export async function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign: signId } = await params;
  const sign = getZodiacById(signId);
  const cookieStore = await cookies();
  const lang = (cookieStore.get("falci-lang")?.value as SupportedLanguage) || "tr";
  const t = getT(lang);

  if (!sign) return { title: t("site.name") };
  
  const localizedName = t(sign.nameKey);
  const dateRange = formatZodiacDate(sign, t);
  
  return {
    title: `${localizedName} | ${t("site.name")}`,
    description: `${localizedName} (${dateRange}) ${t("astrology.label.lucky_numbers")}, ${t("astrology.label.lucky_color")} ${t("hero.subtitle")}`,
  };
}

export default async function ZodiacDetailPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: signId } = await params;
  const sign = getZodiacById(signId);
  const cookieStore = await cookies();
  const lang = (cookieStore.get("falci-lang")?.value as SupportedLanguage) || "tr";
  const t = getT(lang);

  if (!sign) notFound();

  const dateRange = formatZodiacDate(sign, t);

  const compatibleSigns = sign.compatibility
    .map(id => getZodiacById(id))
    .filter(Boolean);

  const elementColors: Record<string, string> = {
    "astrology.element.fire": "from-red-600/30 to-orange-600/30",
    "astrology.element.earth": "from-green-600/30 to-emerald-600/30",
    "astrology.element.air": "from-sky-600/30 to-cyan-600/30",
    "astrology.element.water": "from-blue-600/30 to-indigo-600/30",
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Hero */}
      <section className={`pt-32 md:pt-40 pb-12 px-4 bg-gradient-to-b ${elementColors[sign.elementKey] || ""} to-transparent`}>
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="relative group mb-8">
            <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] float">
              <ZodiacIcon signId={signId} size={224} className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">{t(sign.nameKey)}</h1>
          <p className="text-xl text-gray-400 mb-4">{dateRange}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {sign.elementEmoji} {t(sign.elementKey)}
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {sign.rulingPlanetEmoji} {t(sign.rulingPlanetKey)}
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              🎯 {t(sign.qualityKey)}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Quick Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🎯 {t("chart.overview")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">{t("astrology.label.lucky_numbers")}</p>
              <p className="text-white font-bold text-lg">{sign.luckyNumbers.join(", ")}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">{t("astrology.label.lucky_day")}</p>
              <p className="text-white font-bold text-lg">{t(sign.luckyDayKey)}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">{t("astrology.label.lucky_color")}</p>
              <p className="text-white font-bold text-lg">{t(sign.luckyColorKey) || sign.luckyColor}</p>
            </div>
            <div className="glass-card p-4 text-center hover:border-purple-500/30 transition-colors">
              <p className="text-gray-500 text-xs mb-1">{t("astrology.label.quality")}</p>
              <p className="text-white font-bold text-lg">{t(sign.qualityKey)}</p>
            </div>
          </div>
        </section>

        {/* Daily Horoscope */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">📖 {t("horoscope.daily")} {t("chart.interpretation.title")}</h2>
          <ClientHoroscopeCard signId={signId} period="daily" />
        </section>

        {/* Compatibility */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">💕 {t("nav.compatibility")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compatibleSigns.map((cs) => cs && (
              <Link key={cs.id} href={`/burclar/${cs.id}`}>
                <div className="glass-card p-4 text-center hover:scale-105 transition-all duration-300 hover:border-purple-500/40 group flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border border-white/10 overflow-hidden mb-3 bg-black/40 group-hover:border-purple-500/30 transition-all flex items-center justify-center">
                    <ZodiacIcon signId={cs.id} size={80} className="w-full h-full object-cover group-hover:animate-bounce" />
                  </div>
                  <p className="text-white font-medium">{t(cs.nameKey)}</p>
                  <p className="text-gray-500 text-xs">{formatZodiacDate(cs, t)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Detailed Zodiac Analysis */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{t("zodiac.detail.title")}</h2>
          <div className="space-y-8">
            {/* Personality */}
            <div className="glass-card p-6 md:p-8 hover:border-purple-500/30 transition-colors">
              <h3 className="text-xl font-bold text-purple-300 mb-4">{t("zodiac.detail.section.personality")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.personality`)}</p>
            </div>

            {/* Love */}
            <div className="glass-card p-6 md:p-8 hover:border-pink-500/30 transition-colors border-pink-500/10">
              <h3 className="text-xl font-bold text-pink-300 mb-4">{t("zodiac.detail.section.love")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.love`)}</p>
            </div>

            {/* Career */}
            <div className="glass-card p-6 md:p-8 hover:border-amber-500/30 transition-colors border-amber-500/10">
              <h3 className="text-xl font-bold text-amber-300 mb-4">{t("zodiac.detail.section.career")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.career`)}</p>
            </div>

            {/* Health */}
            <div className="glass-card p-6 md:p-8 hover:border-emerald-500/30 transition-colors border-emerald-500/10">
              <h3 className="text-xl font-bold text-emerald-300 mb-4">{t("zodiac.detail.section.health")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.health`)}</p>
            </div>

            {/* Weaknesses */}
            <div className="glass-card p-6 md:p-8 hover:border-red-500/30 transition-colors border-red-500/10">
              <h3 className="text-xl font-bold text-red-300 mb-4">{t("zodiac.detail.section.weaknesses")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.weaknesses`)}</p>
            </div>

            {/* Famous People */}
            <div className="glass-card p-6 md:p-8 hover:border-sky-500/30 transition-colors border-sky-500/10">
              <h3 className="text-xl font-bold text-sky-300 mb-4">{t("zodiac.detail.section.famous")}</h3>
              <p className="text-gray-300 leading-relaxed text-[15px]">{t(`zodiac.${signId}.famous`)}</p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/burclar" className="px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all">
            ← {t("nav.zodiac")}
          </Link>
          <Link href="/uyumluluk" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            {t("nav.compatibility")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
