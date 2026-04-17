"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery";
import Link from "next/link";
import { zodiacSigns } from "@/data/zodiac";
import ZodiacCard from "@/components/ZodiacCard";
import { useTranslation } from "@/lib/i18n";
import { GlassButton } from "@/components/ui/glass-button";
import Logo from "@/components/Cosmic/Logo";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { Navbar as MiniNavbar } from "@/components/ui/mini-navbar";

export default function HomePage() {
  const { t } = useTranslation();
  const featuredSigns = zodiacSigns.slice(0, 4);

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden -mt-16">
      <MiniNavbar />
      {/* 3D Cosmic Background Layer - FIXED: DIRECT SIBLING OF UI */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [-12, 1.5, 12], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Suspense fallback={null}>
            {/* SHIFTED DOWN for Clear Horizon */}
            <group position={[0, -1, 0]}>
              <ParticleSphere />
            </group>
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            enableRotate={true} 
            rotateSpeed={0.4}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Canvas>
      </div>

      {/* Hero UI Layer - PUSHED HIGHER for Clear Horizon - ADJUSTED TOP */}
      <div className="relative z-10 pointer-events-none">
        <header className="absolute top-28 left-0 right-0 z-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-normal mb-6 font-serif tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] transition-all duration-700">
              Kaderiniz <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-500 underline decoration-amber-500/20 underline-offset-[12px]">Yıldızlarda</span> Saklı
            </h1>
            <p className="text-sm md:text-base text-amber-100/40 mb-10 tracking-[0.4em] uppercase font-light max-w-2xl mx-auto leading-relaxed">
              Gökyüzünün kadim diliyle geleceğine ışık tut
            </p>
            <div className="inline-flex gap-4 pointer-events-auto">
              <Link href="/dogum-haritasi">
                <GlassButton size="lg" className="hover:border-amber-500/30">
                  Analizi Başlat
                </GlassButton>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Spacer to see the 3D gallery */}
        <section className="relative h-screen pointer-events-none" />

        {/* Features Section - RESTORED */}
        <section className="py-24 px-4 bg-black/10">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">{t("home.explore.title")}</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("home.explore.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { icon: <CosmicIcon name="horoscope" size={48} />, title: t("nav.horoscope"), desc: t("home.feature.horoscope.desc"), href: "/yorumlar", theme: "from-purple-900/40 to-indigo-950/60" },
                { icon: <CosmicIcon name="birthchart" size={48} />, title: t("nav.birthchart"), desc: t("home.feature.chart.desc"), href: "/dogum-haritasi", theme: "from-blue-900/40 to-cyan-950/60" },
                { icon: <CosmicIcon name="compatibility" size={48} />, title: t("nav.compatibility"), desc: t("home.feature.compatibility.desc"), href: "/uyumluluk", theme: "from-rose-900/40 to-pink-950/60" },
                { icon: <CosmicIcon name="planets" size={48} />, title: t("nav.planets"), desc: t("home.feature.planets.desc"), href: "/burclar#gezegenler", theme: "from-amber-900/40 to-orange-950/60" },
                { icon: <span className="text-4xl">🔢</span>, title: t("nav.numeroloji"), desc: t("home.feature.numeroloji.desc"), href: "/numeroloji", theme: "from-fuchsia-900/40 to-purple-950/60" },
              ].map((feature, idx) => (
                <Link key={feature.title} href={feature.href} className="group">
                  <div className={`
                      relative overflow-hidden rounded-[2.5rem] p-10 h-full 
                      bg-gradient-to-br ${feature.theme} border border-white/10
                      enhanced-glass hover:scale-[1.05] transition-all duration-700
                      hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]
                      fade-in-up flex flex-col items-center text-center
                    `} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:rotate-[10deg] group-hover:scale-110 transition-all duration-700 relative z-10 shadow-inner">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-brand font-bold text-white mb-4 tracking-wide relative z-10 group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed relative z-10 group-hover:text-gray-200 transition-colors">
                      {feature.desc}
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/5 w-full relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-xs font-bold text-purple-400 tracking-[0.3em] uppercase">Kozmik Analiz →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mistik Portal Section - Refined for Minimalism */}
        <section className="py-32 px-4 relative">
          <div className="max-w-7xl mx-auto pointer-events-auto relative z-10">
            <div className="text-center mb-20">
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative group">
                  <Logo size={80} className="relative z-10" />
                </div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 font-serif tracking-tight">
                {t("home.analytics.title")}
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed tracking-wide italic">
                {t("home.analytics.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "🧬", titleKey: "analytics.biorhythm.title", descKey: "analytics.biorhythm.desc", href: "/biyoritim", theme: "from-cyan-900/40 to-blue-950/60" },
                { icon: "🌙", titleKey: "analytics.dream.title", descKey: "analytics.dream.desc", href: "/ruya-analizi", theme: "from-violet-900/40 to-purple-950/60" },
                { icon: "🔢", titleKey: "analytics.name_num.title", descKey: "analytics.name_num.desc", href: "/numeroloji", theme: "from-fuchsia-900/40 to-pink-950/60" },
              ].map((tool, idx) => (
                <Link key={tool.titleKey} href={tool.href} className="group">
                  <div className={`
                    relative overflow-hidden rounded-[2.5rem] p-10 h-full 
                    bg-gradient-to-br ${tool.theme} border border-white/10
                    enhanced-glass hover:scale-[1.05] transition-all duration-700
                    hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]
                    fade-in-up flex flex-col items-center text-center
                  `} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:rotate-[10deg] group-hover:scale-110 transition-all duration-700 relative z-10 shadow-inner">
                      <span className="text-5xl">{tool.icon}</span>
                    </div>
                    <h3 className="text-2xl font-brand font-bold text-white mb-4 tracking-wide relative z-10 group-hover:text-purple-300 transition-colors">
                      {t(tool.titleKey)}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed relative z-10 group-hover:text-gray-200 transition-colors">
                      {t(tool.descKey)}
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/5 w-full relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-xs font-bold text-purple-400 tracking-[0.3em] uppercase">{t("analytics.cta")} →</span>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Kadim Sistemler Sub-section - ADDED */}
            <div className="mt-16">
              <h3 className="text-center text-2xl font-bold text-white mb-8 font-serif">{t("home.ancient.title")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { id: "iching", nameKey: "fortune.iching.title", href: "/fallar/iching", theme: "from-emerald-900/40 to-emerald-950/60" },
                  { id: "runler", nameKey: "fortune.runler.title", href: "/fallar/runler", theme: "from-blue-900/40 to-blue-950/60" },
                  { id: "kristal", nameKey: "fortune.kristal.title", href: "/fallar/kristal", theme: "from-violet-900/40 to-violet-950/60" },
                ].map((item, idx) => (
                  <Link key={item.id} href={item.href} className="group">
                    <div className={`
                      relative rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center
                      bg-gradient-to-br ${item.theme} border border-white/10
                      enhanced-glass transition-all duration-700 hover:scale-[1.08]
                      hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]
                      fade-in-up
                    `} style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 
                        group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 relative z-10">
                        <CosmicIcon name={item.id as any} size={48} />
                      </div>
                      <p className="text-white text-xs font-brand font-bold tracking-[0.2em] uppercase relative z-10 group-hover:text-purple-300 transition-colors">
                        {t(item.nameKey)}
                      </p>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Zodiac Grid - RESTORED */}
        <section className="py-24 px-4 bg-black/5">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">{t("home.zodiac.title")}</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("home.zodiac.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {zodiacSigns.map((sign) => (
                <ZodiacCard key={sign.id} sign={sign} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Section (Birth Chart CTA) - ADDED */}
        <section className="py-24 px-4 overflow-hidden pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-950 to-[#0a0a2a] border border-white/5 p-8 md:p-16 shadow-2xl">
              {/* Background Light Effects */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 blur-[120px] rounded-full -ml-20 -mb-20" />

              <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 font-serif leading-tight tracking-tight">
                    {t("home.featured.title.1")} <br />
                    <span className="gradient-text">{t("home.featured.title.2")}</span>
                  </h2>
                  <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-light">
                    {t("home.featured.desc")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link href="/dogum-haritasi">
                      <GlassButton size="lg">
                        {t("home.featured.cta")}
                      </GlassButton>
                    </Link>
                    <Link href="/dogum-haritasi">
                      <GlassButton size="lg">
                        {t("nav.calculator")}
                      </GlassButton>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center flex-col items-center">
                  <div className="relative w-72 h-72 md:w-80 md:h-80">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse blur-xl" />
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 spin-slow" />
                    <div className="absolute inset-6 rounded-full border border-white/5 spin-slow" style={{ animationDirection: "reverse", animationDuration: "20s" }} />
                    <div className="absolute inset-12 rounded-full border-dash border-purple-500/10 spin-slow" style={{ animationDuration: "30s" }} />

                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">✨</span>
                      <span className="text-white font-serif tracking-widest uppercase text-sm opacity-60">
                        Celestial Chart
                      </span>
                    </div>

                    {featuredSigns.map((sign, i) => {
                      const angle = (i * 90 - 45) * (Math.PI / 180);
                      const x = 50 + 45 * Math.cos(angle);
                      const y = 50 + 45 * Math.sin(angle);
                      return (
                        <span
                          key={sign.id}
                          className="absolute text-3xl opacity-40 hover:opacity-100 transition-opacity"
                          style={{
                            left: `${Number(x.toFixed(4))}%`,
                            top: `${Number(y.toFixed(4))}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {sign.symbol}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - RESTORED */}
        <section className="py-32 px-4 relative">
          <div className="max-w-4xl mx-auto text-center relative z-10 pointer-events-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-serif leading-tight">
              {t("home.cta.title")}
            </h2>
            <p className="text-gray-400 text-xl mb-12 font-light leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
            <Link href="/yorumlar">
              <GlassButton size="lg">
                {t("home.cta.btn")}
              </GlassButton>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
