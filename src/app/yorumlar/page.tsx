import Link from "next/link";
import { zodiacSigns } from "@/data/zodiac";
import ZodiacCard from "@/components/ZodiacCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burç Yorumları | Astralis",
  description: "Günlük, haftalık, aylık ve yıllık burç yorumlarını keşfedin.",
};

export default function YorumlarPage() {
  const periods = [
    { id: "daily", label: "Günlük", emoji: "📅", desc: "Her gün güncellenen burç yorumları", color: "from-purple-500/20 to-violet-500/20 border-purple-500/20" },
    { id: "weekly", label: "Haftalık", emoji: "📆", desc: "Haftanızı planlamak için detaylı yorumlar", color: "from-pink-500/20 to-rose-500/20 border-pink-500/20" },
    { id: "monthly", label: "Aylık", emoji: "🗓️", desc: "Ay boyunca sizi bekleyen gelişmeler", color: "from-amber-500/20 to-orange-500/20 border-amber-500/20" },
    { id: "yearly", label: "Yıllık", emoji: "📊", desc: "Yılın genel değerlendirmesi ve öngörüler", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20" },
  ];

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-purple-600/30 blur-3xl rounded-full" />
            <span className="relative text-7xl float">✨</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif tracking-tight">
            <span className="gradient-text">Kozmik Burç Yorumları</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Yıldızların anlık konumlarına göre hazırlanan günlük, haftalık, aylık ve yıllık yorumlarla yolunuzu aydınlatın.
          </p>
        </div>
      </section>

      {/* Periods */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {periods.map((period, idx) => (
            <Link key={period.id} href={`/yorumlar/${period.id}`} className="group">
              <div className={`
                glass-card p-8 bg-gradient-to-br ${period.color} 
                hover:scale-[1.03] hover:border-white/30 transition-all duration-500 
                h-full flex flex-col items-center text-center relative overflow-hidden
                fade-in-up
              `} style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
                
                <span className="text-5xl mb-6 block group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{period.emoji}</span>
                <h2 className="text-2xl font-bold text-white mb-3 font-serif tracking-wide">{period.label} Yorumlar</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{period.desc}</p>
                
                <div className="mt-auto px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-purple-300 uppercase tracking-widest group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all">
                   Keşfet →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center gradient-text">Burcunuzu Seçin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {zodiacSigns.map((sign) => (
              <ZodiacCard key={sign.id} sign={sign} compact={true} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
