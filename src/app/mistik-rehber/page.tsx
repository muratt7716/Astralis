"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles, Heart, Eye, Zap, Star, Shield, ArrowRight } from "lucide-react";

const GUIDES = [
  {
    id: "melisa",
    name: "Melisa",
    title: "Mistik Rehber",
    image: "/avatars/melisa.png",
    quote: "Kalbinin sesini dinle, cevap her zaman orada.",
    bio: "Hayatın her alanındaki olaylara kalbinin gözüyle bakar. Aşk, kariyer veya günlük dertler fark etmeksizin, şefkat ve derin bir empatiyle yaklaşır.",
    traits: ["Empatik", "Şefkatli", "Duygusal Zeka"],
    icon: Heart,
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.35)",
    glowStrong: "rgba(244,63,94,0.6)",
    accent: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    gradient: "from-rose-900/60 via-rose-950/40 to-transparent",
  },
  {
    id: "aras",
    name: "Aras",
    title: "Astrolog",
    image: "/avatars/aras.png",
    quote: "Gerçekler acıtır ama yolu aydınlatır.",
    bio: "Karmaşık yaşam durumlarını keskin bir mantık süzgecinden geçirir. Net, uygulanabilir ve stratejik tavsiyeler verir. Somut gerçeklerle ilgilenir.",
    traits: ["Rasyonel", "Net", "Stratejik"],
    icon: Shield,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.35)",
    glowStrong: "rgba(59,130,246,0.6)",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    gradient: "from-blue-900/60 via-blue-950/40 to-transparent",
  },
  {
    id: "umut",
    name: "Umut",
    title: "Şaman",
    image: "/avatars/umut.png",
    quote: "Bazen en iyi ilaç, acı bir kahkadır.",
    bio: "Size en dürüst aynayı tutan modern bir dosttur. Hayatın ciddiyetini bazen esprileriyle dağıtırken, bazen de en acı gerçekleri yüzünüze çarpar.",
    traits: ["Dürüst", "Esprili", "Samimi"],
    icon: Zap,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    glowStrong: "rgba(245,158,11,0.6)",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    gradient: "from-amber-900/60 via-amber-950/40 to-transparent",
  },
  {
    id: "hekate",
    name: "Hekate",
    title: "Gizemli Bilge",
    image: "/avatars/hekate.png",
    quote: "Evrenin dili sembollerle yazılmıştır.",
    bio: "Kadim sembollerin ve ruhsal şifanın derin bilgisine sahiptir. Günümüzün sorunlarına bin yıllık bir bilgelikle yaklaşır.",
    traits: ["Mistik", "Bilge", "Gözlemci"],
    icon: Eye,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.35)",
    glowStrong: "rgba(139,92,246,0.6)",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    gradient: "from-violet-900/60 via-violet-950/40 to-transparent",
  },
  {
    id: "selin",
    name: "Selin",
    title: "Modern Rehber",
    image: "/avatars/selin.png",
    quote: "Zamanın matematiğini çözersen, geleceği okursun.",
    bio: "Yaşamı matematiksel ve astrolojik kesinlikle analiz eder. Gezegenlerin enerjisini ve zamanın akışını kullanarak nokta atışı öngörüler sunar.",
    traits: ["Analitik", "Detaycı", "Dakik"],
    icon: Star,
    color: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    glowStrong: "rgba(16,185,129,0.6)",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    gradient: "from-emerald-900/60 via-emerald-950/40 to-transparent",
  },
];

export default function MistikRehberPage() {
  const { t, dir } = useTranslation();
  const router = useRouter();
  const isRTL = dir === "rtl";

  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const guide = GUIDES[activeIndex];
  const GuideIcon = guide.icon;

  const guideContent = {
    title: t(`guide.${guide.id}.card_title`),
    quote: t(`guide.${guide.id}.quote`),
    bio: t(`guide.${guide.id}.card_bio`),
    traits: [
      t(`guide.${guide.id}.trait1`),
      t(`guide.${guide.id}.trait2`),
      t(`guide.${guide.id}.trait3`),
    ],
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/onboarding");
      return;
    }
    if (profile && !hasInitialized) {
      if (profile.selected_guide_id) {
        const idx = GUIDES.findIndex(g => g.id === profile.selected_guide_id);
        if (idx >= 0) setActiveIndex(idx);
      }
      setHasInitialized(true);
    }
  }, [authLoading, user, profile, hasInitialized, router]);

  const navigate = useCallback((d: number) => {
    setDirection(d);
    setActiveIndex(prev => {
      const next = prev + d;
      if (next < 0) return GUIDES.length - 1;
      if (next >= GUIDES.length) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const handleSelect = async () => {
    if (!user || selecting) return;
    setSelecting(true);

    const timeout = setTimeout(() => {
      setSelecting(false);
    }, 8000);

    try {
      await updateProfile({ selected_guide_id: guide.id });
      router.push(`/mistik-rehber/chat/${guide.id}`);
    } catch {
      setSelecting(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleChat = () => {
    router.push(`/mistik-rehber/chat/${guide.id}`);
  };

  const isSelected = profile?.selected_guide_id === guide.id;

  if (authLoading && !hasInitialized) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 animate-pulse">
            <div className="w-full h-full bg-white/5" />
          </div>
          <p className="text-[9px] text-white/20 uppercase tracking-[0.5em]">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-[#020202] text-white overflow-hidden relative", isRTL ? "rtl" : "ltr")} dir={dir}>

      {/* ── Atmosferik arka plan ─────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={guide.id + "-bg"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          {/* Sol üst ambient */}
          <div
            className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vh] rounded-full blur-[180px]"
            style={{ background: guide.glow, opacity: 0.5 }}
          />
          {/* Sağ alt ambient */}
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vh] rounded-full blur-[150px]"
            style={{ background: guide.glow, opacity: 0.3 }}
          />
          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative z-30 flex items-center justify-between px-5 py-5 md:px-10">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">{t("mistik.back")}</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-2.5 h-2.5 text-white/20" />
            <span className="text-[8px] text-white/20 font-bold uppercase tracking-[0.6em]">{t("mistik.guides_title")}</span>
            <Sparkles className="w-2.5 h-2.5 text-white/20" />
          </div>
          <div className="text-[9px] text-white/15 font-mono tracking-widest">
            {String(activeIndex + 1).padStart(2, "0")} · {String(GUIDES.length).padStart(2, "0")}
          </div>
        </div>

        <div className="w-16 hidden md:block" />
      </header>

      {/* ── Ana İçerik: Mobil/Desktop farklı layout ─────────────── */}
      <main className="relative z-20 flex flex-col lg:grid lg:grid-cols-2 min-h-[calc(100vh-100px)] items-center gap-0 lg:gap-16 px-5 pb-36 lg:pb-8 md:px-10 lg:px-16 max-w-7xl mx-auto">

        {/* ─── Avatar Sütunu ─── */}
        <div className="w-full flex items-center justify-center order-1 lg:order-none py-6 lg:py-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={guide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Glow halkası */}
              <div
                className="absolute inset-0 rounded-[2.5rem] scale-[1.08] blur-3xl opacity-50"
                style={{ background: guide.glow }}
              />

              {/* Kart — 1:1 kare (640x640 görselle eşleşir) */}
              <div
                className="relative w-[270px] h-[270px] sm:w-[330px] sm:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[460px] xl:h-[460px] rounded-[2.5rem] overflow-hidden"
                style={{
                  border: `1px solid ${guide.color}30`,
                  boxShadow: `0 40px 100px -20px ${guide.glow}, 0 0 0 1px ${guide.color}15`,
                }}
              >
                {/* Görsel — tam kare, kırpma yok */}
                <img
                  src={guide.image}
                  alt={guide.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Altta gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Üstte hafif vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

                {/* İkon rozet */}
                <div
                  className={cn("absolute top-5 right-5 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-xl border", guide.bg, guide.border)}
                  style={{ boxShadow: `0 4px 20px ${guide.glow}` }}
                >
                  <GuideIcon className={cn("w-5 h-5", guide.accent)} />
                </div>

                {/* Alt bilgi */}
                <div className="absolute bottom-0 inset-x-0 p-6 lg:p-8">
                  <div className={cn("text-[9px] font-black uppercase tracking-[0.4em] mb-1.5", guide.accent)}>
                    {guideContent.title}
                  </div>
                  <h2
                    className="text-4xl lg:text-5xl font-bold text-white leading-none mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {guide.name}
                  </h2>
                  <p className="text-white/40 text-[12px] italic font-light line-clamp-1">
                    &ldquo;{guideContent.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Yansıma efekti */}
              <div
                className="absolute -bottom-12 inset-x-8 h-12 rounded-b-full blur-2xl opacity-20"
                style={{ background: guide.color }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Bilgi Sütunu ─── */}
        <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={guide.id + "-info"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="max-w-sm lg:max-w-none w-full"
            >
              {/* Başlık */}
              <div className="mb-6">
                <div className={cn("text-[9px] font-black uppercase tracking-[0.5em] mb-3", guide.accent)}>
                  {guideContent.title}
                </div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-none mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {guide.name}
                </h1>
                <div
                  className="h-px w-16 mx-auto lg:mx-0 opacity-40"
                  style={{ background: `linear-gradient(to right, ${guide.color}, transparent)` }}
                />
              </div>

              {/* Alıntı */}
              <p
                className={cn("text-sm lg:text-base italic mb-5 font-light", guide.accent)}
                style={{ opacity: 0.7 }}
              >
                &ldquo;{guideContent.quote}&rdquo;
              </p>

              {/* Bio */}
              <p className="text-white/50 text-[13px] lg:text-[15px] leading-relaxed mb-8 font-light">
                {guideContent.bio}
              </p>

              {/* Özellikler */}
              <div className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start">
                {guideContent.traits.map(trait => (
                  <span
                    key={trait}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border",
                      guide.bg, guide.border, guide.accent
                    )}
                    style={{ opacity: 0.85 }}
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* CTA Butonlar */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 w-full sm:w-auto">

                {/* Ana buton: Konuşmaya Başla */}
                <button
                  onClick={handleSelect}
                  disabled={selecting}
                  className="group relative w-full sm:w-auto px-8 h-14 rounded-2xl font-bold text-[12px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 overflow-hidden"
                  style={{
                    background: guide.color,
                    boxShadow: `0 8px 32px ${guide.glow}`,
                    color: "#000",
                    minWidth: "200px",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    {selecting ? t("mistik.connecting") : t("mistik.start_chat")}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>

                {/* İkincil: Sadece seç (profil kaydeder) */}
                {!isSelected && (
                  <button
                    onClick={async () => {
                      await updateProfile({ selected_guide_id: guide.id });
                      router.push("/profil");
                    }}
                    className="group flex items-center gap-2 px-6 h-14 rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-all border-white/[0.07] hover:border-white/15 hover:bg-white/[0.03] active:scale-95"
                  >
                    <span>{t("mistik.select_guide")}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {isSelected && (
                  <div className={cn("flex items-center gap-2 px-5 h-14 rounded-2xl border text-[10px] font-bold uppercase tracking-[0.25em]", guide.bg, guide.border, guide.accent)}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: guide.color }} />
                    {t("mistik.active_guide")}
                  </div>
                )}
              </div>

              {/* Desktop navigasyon okları */}
              <div className="hidden lg:flex items-center gap-3 mt-12">
                <button
                  onClick={() => navigate(-1)}
                  className="group w-11 h-11 rounded-2xl border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.04] transition-all active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="group w-11 h-11 rounded-2xl border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.04] transition-all active:scale-90"
                >
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <div className="flex items-center gap-1.5 ml-2">
                  {GUIDES.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300 cursor-pointer"
                      onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                      style={{
                        width: i === activeIndex ? "20px" : "5px",
                        height: "5px",
                        background: i === activeIndex ? guide.color : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobil Alt Navigasyon ──────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        <div
          className="px-5 pb-6 pt-10"
          style={{ background: "linear-gradient(to top, #020202 50%, transparent)" }}
        >
          <div className="flex items-center justify-center gap-3">
            {/* Sol ok */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/30 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Thumbnail şeridi */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar px-1">
              {GUIDES.map((g, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                    className="relative flex-shrink-0 transition-all duration-400"
                    style={{ transform: isActive ? "scale(1.1)" : "scale(0.85)", opacity: isActive ? 1 : 0.3 }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl overflow-hidden"
                      style={{
                        border: isActive ? `1.5px solid ${g.color}60` : "1.5px solid rgba(255,255,255,0.06)",
                        boxShadow: isActive ? `0 0 20px ${g.glow}` : "none",
                      }}
                    >
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover object-top" />
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="thumb-dot"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: g.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sağ ok */}
            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/30 active:scale-90 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>
    </div>
  );
}
