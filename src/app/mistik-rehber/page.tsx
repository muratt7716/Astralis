"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, updateProfile } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles, Loader2, Star, Shield, Heart, Eye, Zap } from "lucide-react";

const GUIDES = [
  {
    id: "melisa",
    name: "Melisa",
    title: "Empatik Rehber",
    image: "/avatars/melisa.png",
    quote: "Kalbinin sesini dinle, cevap her zaman orada.",
    bio: "Hayatın her alanındaki olaylara kalbinin gözüyle bakar. Aşk, kariyer veya günlük dertler fark etmeksizin, size şefkat ve derin bir empatiyle yaklaşır. Onunla konuşurken kendinizi en yakın dostunuzla dertleşiyor gibi hissedeceksiniz.",
    traits: ["Empatik", "Şefkatli", "Duygusal Zeka"],
    icon: Heart,
    gradient: "from-rose-600 via-pink-500 to-fuchsia-400",
    glow: "rgba(244,63,94,0.4)",
    accentBg: "bg-rose-500/10",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/20",
  },
  {
    id: "aras",
    name: "Aras",
    title: "Pragmatik Analist",
    image: "/avatars/aras.png",
    quote: "Gerçekler acıtır ama yolu aydınlatır.",
    bio: "Karmaşık yaşam durumlarını keskin bir mantık süzgecinden geçirir. İster bir ilişki sorunu ister finansal bir karar olsun, size net, uygulanabilir ve stratejik tavsiyeler verir. Romantizmden ziyade somut gerçeklerle ilgilenir.",
    traits: ["Rasyonel", "Net", "Stratejik"],
    icon: Shield,
    gradient: "from-blue-600 via-cyan-500 to-sky-400",
    glow: "rgba(59,130,246,0.4)",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-400",
    accentBorder: "border-blue-500/20",
  },
  {
    id: "umut",
    name: "Umut",
    title: "Dostane Eleştirmen",
    image: "/avatars/umut.png",
    quote: "Bazen en iyi ilaç, acı bir kahkadır.",
    bio: "Size en dürüst aynayı tutan modern bir dosttur. Hayatın ciddiyetini bazen esprileriyle dağıtırken, bazen de en acı gerçekleri yüzünüze çarpar. Onunla her konuyu samimiyetle ve bir uyanış gibi konuşabilirsiniz.",
    traits: ["Dürüst", "Esprili", "Samimi"],
    icon: Zap,
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
    glow: "rgba(245,158,11,0.4)",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/20",
  },
  {
    id: "hekate",
    name: "Hekate",
    title: "Kadim Bilge",
    image: "/avatars/hekate.png",
    quote: "Evrenin dili sembollerle yazılmıştır.",
    bio: "Kadim sembollerin ve ruhsal şifanın derin bilgisine sahiptir. Günümüzün modern sorunlarına bin yıllık bir bilgelikle yaklaşır. Rüyalardan günlük hayattaki işaretlere kadar her şeyi spiritüel bir derinlikte yorumlar.",
    traits: ["Mistik", "Bilge", "Gözlemci"],
    icon: Eye,
    gradient: "from-violet-600 via-purple-500 to-indigo-400",
    glow: "rgba(139,92,246,0.4)",
    accentBg: "bg-violet-500/10",
    accentText: "text-violet-400",
    accentBorder: "border-violet-500/20",
  },
  {
    id: "selin",
    name: "Selin",
    title: "Modern Gözlemci",
    image: "/avatars/selin.png",
    quote: "Zamanın matematiğini çözersen, geleceği okursun.",
    bio: "Yaşamı matematiksel ve astrolojik bir kesinlikle analiz eder. Gezegenlerin enerjisini ve zamanın akışını kullanarak size nokta atışı zamanlamalar ve öngörüler sunar. Bilimle sezgiyi her konuda harmanlayarak size rehberlik eder.",
    traits: ["Analitik", "Detaycı", "Dakik"],
    icon: Star,
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    glow: "rgba(16,185,129,0.4)",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/20",
  },
];

export default function MistikRehberPage() {
  const { t, dir } = useTranslation();
  const router = useRouter();
  const isRTL = dir === "rtl";

  const { user, profile, loading: authLoading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selecting, setSelecting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const guide = GUIDES[activeIndex];

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

  const navigate = useCallback((dir: number) => {
    setDirection(dir);
    setActiveIndex(prev => {
      const next = prev + dir;
      if (next < 0) return GUIDES.length - 1;
      if (next >= GUIDES.length) return 0;
      return next;
    });
  }, []);

  const handleSelect = async () => {
    if (!profile) return;
    setSelecting(true);
    try {
      await updateProfile({ selected_guide_id: guide.id });
      router.push("/profil");
    } catch {
      setSelecting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Bypass loader if profile is already available (from previous page)
  if (authLoading && !profile && !hasInitialized) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] animate-pulse">MİSTİK REHBERE BAĞLANIYOR...</p>
        </div>
      </div>
    );
  }

  const GuideIcon = guide.icon;

  return (
    <div
      className={cn("min-h-screen bg-[#030303] text-white overflow-hidden relative", isRTL ? "rtl" : "ltr")}
      dir={dir}
      ref={containerRef}
    >
      {/* Atmospheric background glow that changes with guide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={guide.id + "-bg"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          <div
            className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[200px] opacity-20"
            style={{ background: `radial-gradient(circle, ${guide.glow}, transparent 70%)` }}
          />
          <div
            className="absolute bottom-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-10"
            style={{ background: `radial-gradient(circle, ${guide.glow}, transparent 70%)` }}
          />
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        </motion.div>
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline font-light tracking-wide">{t("mistik.back")}</span>
        </button>

        <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
          <Sparkles className="w-3 h-3" />
          {t("mistik.guide_selection")}
        </div>

        <div className="text-white/20 text-[10px] font-mono tracking-wider">
          {String(activeIndex + 1).padStart(2, "0")} / {String(GUIDES.length).padStart(2, "0")}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center min-h-[calc(100vh-80px)] px-6 md:px-12 lg:px-20 gap-8 lg:gap-0">

        {/* Left: Guide Image */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center py-8 lg:py-0">
          {/* Navigation arrows — desktop */}
          <button
            onClick={() => navigate(-1)}
            className="hidden lg:flex absolute left-0 xl:left-8 z-30 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={guide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Glow ring behind avatar */}
              <div
                className="absolute inset-0 rounded-[3rem] blur-[80px] opacity-30 scale-110"
                style={{ background: `linear-gradient(135deg, ${guide.glow}, transparent)` }}
              />

              {/* Main image container */}
              <div className="relative w-[280px] h-[380px] sm:w-[320px] sm:h-[440px] lg:w-[380px] lg:h-[520px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group isolate transform-gpu">
                <img
                  src={guide.image}
                  alt={guide.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Quote overlay */}
                <div className="absolute bottom-0 inset-x-0 p-8">
                  <p className="text-white/60 text-sm italic font-serif leading-relaxed">
                    &ldquo;{guide.quote}&rdquo;
                  </p>
                </div>

                {/* Icon badge */}
                <div className={cn("absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border", guide.accentBg, guide.accentBorder)}>
                  <GuideIcon className={cn("w-5 h-5", guide.accentText)} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => navigate(1)}
            className="hidden lg:flex absolute right-0 xl:right-8 z-30 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Guide Info */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start lg:pl-12 xl:pl-20 pb-12 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={guide.id + "-info"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="max-w-md text-center lg:text-left"
            >
              {/* Title label */}
              <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.25em] mb-6", guide.accentBg, guide.accentBorder, guide.accentText)}>
                <GuideIcon className="w-3 h-3" />
                {guide.title}
              </div>

              {/* Name */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-brand font-bold tracking-tight mb-6">
                <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", guide.gradient)}>
                  {guide.name}
                </span>
              </h1>

              {/* Bio */}
              <p className="text-white/40 text-base lg:text-lg leading-relaxed font-light mb-8">
                {guide.bio}
              </p>

              {/* Traits */}
              <div className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start">
                {guide.traits.map(trait => (
                  <span
                    key={trait}
                    className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
                <button
                  onClick={handleSelect}
                  disabled={selecting}
                  className={cn(
                    "relative h-16 px-10 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden group",
                    "bg-white text-black hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.25)] active:scale-[0.97]",
                    selecting && "opacity-60 pointer-events-none"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {selecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    {profile?.selected_guide_id === guide.id ? t("mistik.current_guide") : t("mistik.select_guide")}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: Guide Thumbnails */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="flex items-end justify-center gap-3 pb-8 px-6">
          {GUIDES.map((g, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={g.id}
                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                className={cn(
                  "relative rounded-2xl overflow-hidden transition-all duration-500 border-2",
                  isActive
                    ? "w-16 h-20 sm:w-20 sm:h-24 border-white/40 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]"
                    : "w-12 h-16 sm:w-14 sm:h-18 border-white/[0.06] opacity-40 hover:opacity-70 hover:border-white/15"
                )}
              >
                <img
                  src={g.image}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {isActive && (
                  <motion.div
                    layoutId="guide-indicator"
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ background: `linear-gradient(to right, ${g.glow}, transparent)` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile swipe navigation */}
      <div className="lg:hidden fixed bottom-28 inset-x-0 z-20 flex items-center justify-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-white active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-white active:scale-90 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
