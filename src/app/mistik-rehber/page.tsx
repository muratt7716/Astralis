"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, updateProfile, getCurrentProfile } from "@/lib/auth-helpers";
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

  const { user, profile, loading: authLoading, updateProfile } = useAuth();
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
    if (!user) return;

    // 1. Instant optimistic update through context
    // This will update the local state and cache immediately
    updateProfile({ selected_guide_id: guide.id });

    // 2. Instant redirection - No waiting for DB sync
    router.push("/profil");
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

  // Simplified loading: only block if we are absolutely sure we need auth and it's still determining
  const showLoader = authLoading && !user && !hasInitialized;

  if (showLoader) {
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
      className={cn("min-h-screen bg-[#030303] text-white overflow-y-auto lg:overflow-hidden relative selection:bg-purple-500/30", isRTL ? "rtl" : "ltr")}
      dir={dir}
      ref={containerRef}
    >
      {/* Premium Background Glow — Multi-layered for depth */}
      <AnimatePresence mode="wait">
        <motion.div
          key={guide.id + "-bg"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          {/* Dynamic spotlights */}
          <div
            className="absolute top-[-10%] right-[-5%] w-[80%] h-[80%] rounded-full blur-[150px] opacity-20 transform-gpu"
            style={{ background: `radial-gradient(circle, ${guide.glow}, transparent 70%)` }}
          />
          <div
            className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-15 transform-gpu"
            style={{ background: `radial-gradient(circle, ${guide.glow}, transparent 70%)` }}
          />

          {/* Atmospheric StarField simulation overlay */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-screen overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
          </div>

          {/* Grain for cinematic texture */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation & Header Section */}
      <header className="relative z-30 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-bold uppercase tracking-widest">{t("mistik.back")}</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-white/10 text-[9px] font-bold uppercase tracking-[0.6em] mb-1">
            <Sparkles className="w-3 h-3" />
            V O I D S I G H T
          </div>
          <div className="text-white/40 text-[10px] font-mono tracking-widest bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
            {String(activeIndex + 1).padStart(2, "0")} / {String(GUIDES.length).padStart(2, "0")}
          </div>
        </div>

        <div className="w-24 hidden md:block" /> {/* Visual balance spacer */}
      </header>

      {/* Hero Section — Optimized for Responsiveness */}
      <main className="relative z-20 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-160px)] px-6 lg:px-12 pb-32 lg:pb-0 gap-12 lg:gap-20 max-w-[1600px] mx-auto">

        {/* Visual Content (Avatar) */}
        <div className="relative w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center order-1 lg:order-none group/avatar-container">

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={guide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.9, filter: "blur(20px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.9, filter: "blur(20px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full flex justify-center"
            >
              {/* Decorative light arcs */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -z-10 bg-gradient-to-tr from-purple-500/0 via-white/10 to-purple-500/0 blur-3xl opacity-30 h-[120%] w-[120%]" />

              {/* Premium Card Design — 1:1 Square Aspect Ratio for Zero Cropping */}
              <div className="relative group perspective-2000">
                <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] xl:w-[580px] xl:h-[580px] 2xl:w-[640px] 2xl:h-[640px] rounded-[3rem] p-[1.5px] overflow-hidden bg-gradient-to-b from-white/30 to-transparent transition-transform duration-1000 ease-out-expo hover:rotate-y-6 shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
                  <div className="absolute inset-0 bg-[#070707] rounded-[3rem]" />
                  
                  {/* Image — No zoom, perfect 1:1 match */}
                  <div className="relative w-full h-full rounded-[3rem] overflow-hidden">
                    <img
                      src={guide.image}
                      alt={guide.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-1000"
                    />

                    {/* Shadow & Gradient Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent opacity-60" />

                    {/* Badge */}
                    <div className={cn("absolute top-8 right-8 w-14 h-14 rounded-3xl flex items-center justify-center backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-700 group-hover:scale-110", guide.accentBg)}>
                      <GuideIcon className={cn("w-6 h-6 drop-shadow-glow", guide.accentText)} />
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-10 space-y-6">
                      <div className="space-y-2">
                        <div className={cn("text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em]", guide.accentText)}>
                          {guide.title}
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-brand font-bold text-white tracking-tighter leading-none">
                          {guide.name}
                        </h2>
                      </div>
                      <p className="text-white/60 text-sm sm:text-base italic font-light leading-relaxed max-w-[90%]">
                        &ldquo;{guide.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ground reflection */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[90%] h-40 bg-gradient-to-b from-white/10 to-transparent blur-3xl opacity-30 -z-10" />
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Info Content (About Guide) */}
        <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-none pb-12 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={guide.id + "-info"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-xl w-full flex flex-col items-center lg:items-start"
            >
              {/* Bio Description */}
              <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light mb-8 lg:mb-12 px-6 lg:px-0 max-w-lg">
                {guide.bio}
              </p>

              {/* Traits */}
              <div className="flex flex-wrap gap-3 mb-10 lg:mb-16 justify-center lg:justify-start">
                {guide.traits.map(trait => (
                  <span
                    key={trait}
                    className="px-6 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-bold text-white/50 uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:text-white transition-all cursor-default"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              {/* Selection Button */}
              <div className="w-full sm:w-auto px-6 lg:px-0 z-40">
                <button
                  onClick={handleSelect}
                  disabled={selecting}
                  className={cn(
                    "relative w-full lg:w-[320px] h-20 rounded-3xl font-black text-[13px] uppercase tracking-[0.25em] transition-all duration-700 group overflow-hidden shadow-[0_20px_60px_-15px_rgba(255,255,255,0.15)]",
                    "bg-white text-black hover:bg-white/90 active:scale-95",
                    selecting && "opacity-50 pointer-events-none"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {selecting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : profile?.selected_guide_id === guide.id ? (
                      <Zap className="w-5 h-5 fill-current" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    {selecting ? "Transmisyona Bağlanılıyor..." : profile?.selected_guide_id === guide.id ? "Şu Anki Rehberin" : "Bu Rehberi Seç"}
                  </span>

                  {/* Subtle shine effect */}
                  <div className="absolute top-0 -inset-x-full h-full w-1/2 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 group-hover:animate-shine" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modern Horizontal Pager Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-gradient-to-t from-black via-black/80 to-transparent pb-8 pt-20 px-4">
        <div className="max-w-md mx-auto relative">
          {/* Scrollable container for thumbnails */}
          <div className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar py-4 px-2">
            {GUIDES.map((g, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={g.id}
                  onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
                  className={cn(
                    "group relative flex-shrink-0 transition-all duration-500",
                    isActive ? "scale-110" : "scale-90 hover:scale-95 grayscale opacity-30 hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  {/* Thumbnail Ring */}
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-2xl p-[1px] transition-all duration-500",
                    isActive ? "bg-gradient-to-tr from-white to-white/20" : "bg-white/5"
                  )}>
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/40">
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Tooltip-like Indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-dot"
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_white]"
                      />
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* Mobile Arrows — Positioned safely outside thumbnails */}
          <div className="lg:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 pointer-events-auto active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 pointer-events-auto active:scale-90 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-2:hover { transform: rotateY(8deg) rotateX(2deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .drop-shadow-glow { filter: drop-shadow(0 0 10px currentColor); }
        @keyframes shine {
          0% { left: -100%; transition-property: left; }
          100% { left: 100%; transition-property: left; }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
      `}</style>
    </div>
  );
}
