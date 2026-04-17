"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getCurrentProfile, updateProfile, uploadAvatar, signOut } from "@/lib/auth-helpers";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/image-utils";
import { getZodiacByDate, zodiacSigns } from "@/data/zodiac";
import { getPlanetById } from "@/data/planets";
import { calculateBirthChart } from "@/lib/astrology";
import { logInteraction } from "@/lib/logging";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import PlanetIcon from "@/components/PlanetIcon";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Save,
  Upload,
  Loader2,
  Sparkles,
  MessageSquare,
  Globe,
  ChevronRight,
  Hash,
  Waves,
  Eye,
  CheckCircle2,
  X,
  LogOut,
  Orbit,
  Sun,
  Moon,
  Sunrise,
  Heart,
  Shield,
  Zap,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants ---

const GUIDES = [
  {
    id: "melisa", name: "Melisa", image: "/avatars/melisa.png", role: "Empatik Rehber",
    bio: "Hayatın her alanındaki olaylara kalbinin gözüyle bakar. Şefkat ve derin bir empatiyle yaklaşır.",
    traits: ["Empatik", "Şefkatli", "Duygusal Zeka"],
    gradient: "from-rose-500/20 to-pink-500/20", accent: "text-rose-400", glow: "rgba(244,63,94,0.3)",
    borderAccent: "border-rose-500/30", bgAccent: "bg-rose-500/10",
  },
  {
    id: "aras", name: "Aras", image: "/avatars/aras.png", role: "Pragmatik Analist",
    bio: "Karmaşık durumları keskin mantık süzgecinden geçirir. Net ve stratejik tavsiyeler verir.",
    traits: ["Rasyonel", "Net", "Stratejik"],
    gradient: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", glow: "rgba(59,130,246,0.3)",
    borderAccent: "border-blue-500/30", bgAccent: "bg-blue-500/10",
  },
  {
    id: "umut", name: "Umut", image: "/avatars/umut.png", role: "Dostane Eleştirmen",
    bio: "En dürüst aynayı tutan modern bir dost. Esprileriyle dağıtır, gerçekleri yüzünüze çarpar.",
    traits: ["Dürüst", "Esprili", "Samimi"],
    gradient: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400", glow: "rgba(245,158,11,0.3)",
    borderAccent: "border-amber-500/30", bgAccent: "bg-amber-500/10",
  },
  {
    id: "hekate", name: "Hekate", image: "/avatars/hekate.png", role: "Kadim Bilge",
    bio: "Kadim sembollerin ve ruhsal şifanın derin bilgisine sahip. Bin yıllık bilgelikle yaklaşır.",
    traits: ["Mistik", "Bilge", "Gözlemci"],
    gradient: "from-violet-500/20 to-purple-500/20", accent: "text-violet-400", glow: "rgba(139,92,246,0.3)",
    borderAccent: "border-violet-500/30", bgAccent: "bg-violet-500/10",
  },
  {
    id: "selin", name: "Selin", image: "/avatars/selin.png", role: "Modern Gözlemci",
    bio: "Yaşamı matematiksel ve astrolojik kesinlikle analiz eder. Nokta atışı öngörüler sunar.",
    traits: ["Analitik", "Detaycı", "Dakik"],
    gradient: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-400", glow: "rgba(16,185,129,0.3)",
    borderAccent: "border-emerald-500/30", bgAccent: "bg-emerald-500/10",
  },
];

const ALL_TOOLS = [
  { id: "astrology", name: "Doğum Haritası", icon: <CosmicIcon name="birthchart" size={20} />, href: "/dogum-haritasi", color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "dream", name: "Rüya Analizi", icon: <CosmicIcon name="dream" size={20} />, href: "/ruya-analizi", color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "bio", name: "Biyoritim", icon: <CosmicIcon name="biorhythm" size={20} />, href: "/biyoritim", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { id: "sphere", name: "Kristal Küre", icon: <CosmicIcon name="kristal" size={20} />, href: "/fallar/kristal", color: "text-rose-400", bg: "bg-rose-500/10" },
  { id: "numerology", name: "Numeroloji", icon: <CosmicIcon name="numerology" size={20} />, href: "/numeroloji", color: "text-indigo-400", bg: "bg-indigo-500/10" },
];

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

const RELATIONSHIP_KEYS = [
  { value: "single", key: "profile.rel.single" },
  { value: "relationship", key: "profile.rel.relationship" },
  { value: "complicated", key: "profile.rel.complicated" },
  { value: "married", key: "profile.rel.married" },
  { value: "platonik", key: "profile.rel.platonik" },
];

const LIFE_FOCUS_KEYS = [
  { value: "general", key: "profile.focus.general" },
  { value: "love", key: "profile.focus.love" },
  { value: "career", key: "profile.focus.career" },
  { value: "health", key: "profile.focus.health" },
  { value: "spiritual", key: "profile.focus.spiritual" },
];

// --- Section label component ---
function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 mb-6", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

// --- Toast ---
function Toast({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (visible) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-emerald-500/90 backdrop-blur-xl text-white text-sm font-medium shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Utils ---
const normalizePlanetId = (name: string) => {
  const map: Record<string, string> = {
    "güneş": "gunes",
    "ay": "ay",
    "merkür": "merkur",
    "venüs": "venus",
    "mars": "mars",
    "jüpiter": "jupiter",
    "satürn": "saturn",
    "uranüs": "uranus",
    "neptün": "neptun",
    "plüton": "pluton"
  };
  return map[name.toLowerCase()] || name.toLowerCase();
};

// ============================
// MAIN COMPONENT
// ============================

export default function ProfilePage() {
  const router = useRouter();
  const { t, dir } = useTranslation();
  const isRTL = dir === "rtl";
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeGuideId, setActiveGuideId] = useState<string>("melisa");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<any>(null);
  const [fetchingHoroscope, setFetchingHoroscope] = useState(false);
  const [topToolIds, setTopToolIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    birth_time: "",
    birth_city: "",
    relationship_status: "single",
    life_focus: "general",
    language: "tr",
  });

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return { activities: [], topTools: [], horoscope: null };
    const savedActivities = localStorage.getItem(`activities-${user?.id}`);
    const savedTools = localStorage.getItem(`top-tools-${user?.id}`);
    const savedHoroscope = localStorage.getItem(`horoscope-${user?.id}`);
    return {
      activities: savedActivities ? JSON.parse(savedActivities) : [],
      topTools: savedTools ? JSON.parse(savedTools) : [],
      horoscope: savedHoroscope ? JSON.parse(savedHoroscope) : null
    };
  }, [user?.id]);

  const fetchDynamicData = useCallback(async (userId: string, currentProfile?: any) => {
    const today = new Date().toISOString().split("T")[0];
    const cachedHoroscope = currentProfile?.daily_horoscope;
    const hasValidHoroscope = cachedHoroscope?.date === today && cachedHoroscope?.language === (currentProfile?.language || 'tr');

    // If we have a valid horoscope in the profile, don't show the initial loader
    if (!hasValidHoroscope || !horoscopeData) {
      setFetchingHoroscope(true);
    }

    try {
      const [hRes, tRes, aRes] = await Promise.all([
        fetch(`/api/ai/daily-horoscope?userId=${userId}`),
        fetch(`/api/user/top-tools?userId=${userId}`),
        fetch(`/api/user/activity?userId=${userId}`),
      ]);
      const [hData, tData, aData] = await Promise.all([hRes.json(), tRes.json(), aRes.json()]);

      if (hData.horoscope) {
        setHoroscopeData(hData.horoscope);
        localStorage.setItem(`horoscope-${userId}`, JSON.stringify(hData.horoscope));
      }

      if (tData.topTools) {
        setTopToolIds(tData.topTools);
        localStorage.setItem(`top-tools-${userId}`, JSON.stringify(tData.topTools));
      }

      if (aData.activities) {
        setActivities(aData.activities);
        localStorage.setItem(`activities-${userId}`, JSON.stringify(aData.activities));
      }
    } catch (err) {
      console.error("Dynamic data fetch failed", err);
    } finally {
      setFetchingHoroscope(false);
    }
  }, []); // Fixed: Removed horoscopeData to prevent loops

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/onboarding"); return; }
    if (!authProfile) return;

    setProfile(authProfile);
    setActiveGuideId(authProfile.selected_guide_id || "melisa");

    // Immediate usage of cached data
    const today = new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(new Date()).split('.').reverse().join('-');

    if (authProfile.daily_horoscope?.date === today && authProfile.daily_horoscope?.language === (authProfile.language || 'tr')) {
      setHoroscopeData(authProfile.daily_horoscope);
    }

    const { activities: cachedActs, topTools: cachedTools, horoscope: cachedHoro } = getCachedData();
    if (cachedActs.length > 0) setActivities(cachedActs);
    if (cachedTools.length > 0) setTopToolIds(cachedTools);
    if (cachedHoro && !horoscopeData) setHoroscopeData(cachedHoro);

    setFormData({
      full_name: authProfile.full_name || "",
      birth_date: authProfile.birth_date || "",
      birth_time: authProfile.birth_time || "",
      birth_city: authProfile.birth_city || "",
      relationship_status: authProfile.relationship_status || "single",
      life_focus: authProfile.life_focus || "general",
      language: authProfile.language || "tr",
    });
    fetchDynamicData(authProfile.id, authProfile);
  }, [authLoading, user, authProfile, router, fetchDynamicData, getCachedData]);

  const zodiacSign = useMemo(() => {
    if (!profile?.birth_date) return null;
    const d = new Date(profile.birth_date);
    return getZodiacByDate(d.getMonth() + 1, d.getDate());
  }, [profile?.birth_date]);

  // Calculate birth chart for rising/moon sign when birth_time is available
  const birthChart = useMemo(() => {
    if (!profile?.birth_date || !profile?.birth_time) return null;
    try {
      const d = new Date(profile.birth_date);
      const [h, m] = profile.birth_time.split(":").map(Number);
      return calculateBirthChart(
        d.getFullYear(), d.getMonth() + 1, d.getDate(),
        h, m,
        profile.latitude || 39.9, profile.longitude || 32.8
      );
    } catch { return null; }
  }, [profile?.birth_date, profile?.birth_time, profile?.latitude, profile?.longitude]);

  // Derived sign info — prefer calculated, fallback to DB
  const risingSignName = birthChart?.risingSign?.name || profile?.rising_sign || null;
  const risingSignId = birthChart?.risingSign?.id || zodiacSigns.find(z => z.name === profile?.rising_sign)?.id || null;
  const moonSignName = birthChart?.moonSign?.name || profile?.moon_sign || null;
  const moonSignId = birthChart?.moonSign?.id || zodiacSigns.find(z => z.name === profile?.moon_sign)?.id || null;

  const topTools = useMemo(() => {
    if (topToolIds.length === 0) return [];
    return topToolIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean);
  }, [topToolIds]);

  const activeGuide = useMemo(() => GUIDES.find(g => g.id === activeGuideId) || GUIDES[0], [activeGuideId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (selectedAvatar) {
        const optimizedFile = await compressImage(selectedAvatar);
        avatarUrl = await uploadAvatar(optimizedFile);
      }
      const isLangChanged = formData.language !== profile.language;
      await updateProfile({ ...formData, avatar_url: avatarUrl });
      const updated = await getCurrentProfile();
      setProfile(updated);
      if (isLangChanged) fetchDynamicData(profile.id);
      showToast(t("profile.saved"));
      setSettingsOpen(false);
    } catch (err: any) {
      showToast("Hata: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectGuide = async (id: string) => {
    setActiveGuideId(id);
    try {
      await updateProfile({ selected_guide_id: id });
      logInteraction(profile.id, "select_guide", `Guide selected: ${id}`);
      showToast(`${GUIDES.find(g => g.id === id)?.name} ${t("profile.guide_selected")}`);
    } catch (err) {
      console.error("Failed to save guide selection", err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // --- Loading ---
  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase">{t("profile.loading")}</p>
        </motion.div>
      </div>
    );
  }

  // ============================
  // RENDER
  // ============================

  return (
    <div className={cn("min-h-screen bg-[#050508] text-white flex flex-col selection:bg-purple-500/30", isRTL ? "rtl" : "ltr")} dir={dir}>

      {/* Atmospheric bg */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[200px] opacity-[0.07]" style={{ background: `radial-gradient(circle, ${activeGuide.glow}, transparent 70%)` }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[180px] opacity-[0.05] bg-indigo-600" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-28 pb-20 w-full flex-grow">

        {/* ========== HERO: Identity ========== */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative group/avatar shrink-0">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-110 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
              <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-2 ring-white/[0.06] group-hover/avatar:ring-white/20 transition-all duration-500">
                <AvatarImage src={previewUrl || profile.avatar_url} className="object-cover" />
                <AvatarFallback className="text-3xl bg-white/5 text-white/40 font-serif">{profile.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 bg-white/10 backdrop-blur-md rounded-full cursor-pointer hover:bg-white/20 transition-all active:scale-90 border border-white/10 opacity-0 group-hover/avatar:opacity-100 translate-y-1 group-hover/avatar:translate-y-0 duration-300">
                <Upload className="w-3.5 h-3.5 text-white/70" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white mb-2">
                {profile.full_name}
              </h1>

              {/* Zodiac triple */}
              {zodiacSign && (
                <div className="flex items-center gap-2.5 justify-center md:justify-start mb-4 flex-wrap">
                  {/* Sun sign */}
                  <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 group/badge hover:bg-amber-500/15 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <ZodiacIcon signId={zodiacSign.id} variant="classic" size={16} glowColor="#f59e0b" className="text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-amber-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.sun_sign") || "Güneş"}</span>
                      <span className="text-[11px] font-bold text-amber-300 leading-tight">{zodiacSign.name}</span>
                    </div>
                  </div>

                  {/* Rising sign */}
                  {risingSignName && risingSignId && (
                    <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 group/badge hover:bg-orange-500/15 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                        <ZodiacIcon signId={risingSignId} variant="classic" size={16} glowColor="#f97316" className="text-orange-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-orange-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.rising_sign") || "Yükselen"}</span>
                        <span className="text-[11px] font-bold text-orange-300 leading-tight">{risingSignName}</span>
                      </div>
                    </div>
                  )}

                  {/* Moon sign */}
                  {moonSignName && moonSignId && (
                    <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group/badge hover:bg-blue-500/15 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <ZodiacIcon signId={moonSignId} variant="classic" size={16} glowColor="#3b82f6" className="text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-blue-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.moon_sign") || "Ay"}</span>
                        <span className="text-[11px] font-bold text-blue-300 leading-tight">{moonSignName}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 justify-center md:justify-start text-white/25 text-xs flex-wrap">
                {formData.birth_date && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formData.birth_date}</span>
                )}
                {formData.birth_time && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formData.birth_time}</span>
                )}
                {formData.birth_city && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {formData.birth_city}</span>
                )}
                {zodiacSign && (
                  <>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {zodiacSign.element}</span>
                    <span className="text-white/15">·</span>
                    <span>{zodiacSign.rulingPlanet}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium"
              >
                {t("profile.settings")}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/15 transition-all"
                title={t("profile.sign_out")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* --- COL 1: Guide + Quick Tools --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-4 space-y-6">

            {/* Active Guide */}
            <div className={cn("relative rounded-[2rem] overflow-hidden border p-8 group isolate transform-gpu", activeGuide.borderAccent)} style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.8))` }}>
              {/* Guide image bg */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                <img src={activeGuide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", activeGuide.accent)}>{t("profile.active_guide")}</span>
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", activeGuide.bgAccent)} style={{ boxShadow: `0 0 12px ${activeGuide.glow}` }} />
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <Avatar className={cn("w-20 h-20 border-2", activeGuide.borderAccent)}>
                      <AvatarImage src={activeGuide.image} className="object-cover" />
                      <AvatarFallback className="bg-white/5">{activeGuide.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white leading-tight">{activeGuide.name}</h3>
                    <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mt-1", activeGuide.accent)}>{activeGuide.role}</p>
                  </div>
                </div>

                <p className="text-white/40 text-[13px] leading-relaxed mb-6 italic">"{activeGuide.bio}"</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {activeGuide.traits.map((trait: string) => (
                    <span key={trait} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.05] text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] shrink-0">{trait}</span>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push(`/mistik-rehber/${activeGuideId}`)}
                    className="w-full h-12 rounded-2xl bg-white text-black text-[12px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> {t("profile.start_chat")}
                  </button>
                  <button
                    onClick={() => router.push("/mistik-rehber")}
                    className={cn("w-full h-12 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5", activeGuide.borderAccent, activeGuide.accent)}
                  >
                    {t("profile.change_guide")}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-6">
              <SectionLabel>{t("profile.tools")}</SectionLabel>
              <div className="grid grid-cols-1 gap-2.5">
                {ALL_TOOLS.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => router.push(tool.href)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/10 transition-all group text-left"
                  >
                    <div className={cn("shrink-0 transition-transform group-hover:scale-110 duration-500", tool.color)}>{tool.icon}</div>
                    <span className="text-[11px] font-bold text-white/40 group-hover:text-white/70 transition-colors tracking-widest uppercase">{tool.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/10 group-hover:text-white/30 transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- COL 2: Daily Insight + Zodiac Detail --- */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-8 space-y-6">

            {/* Daily Insight - Wider and richer */}
            <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-[100px] rounded-full -ml-10 -mb-10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 block">{t("profile.daily_flow")}</span>
                      <span className="text-[9px] text-white/10 uppercase tracking-widest mt-0.5 block">{new Date().toLocaleDateString(dir === 'rtl' ? 'ar-EG' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  {fetchingHoroscope && <Loader2 className="w-4 h-4 animate-spin text-purple-400/40" />}
                </div>

                <div className="max-w-2xl">
                  <h2 className={cn(
                    "text-3xl md:text-4xl font-serif font-bold tracking-tight leading-tight mb-6 transition-all duration-1000",
                    fetchingHoroscope ? "opacity-20 blur-md" : "opacity-100"
                  )}>
                    {horoscopeData?.title || t("profile.daily_preparing")}
                  </h2>

                  <div className={cn(
                    "text-white/40 text-base leading-relaxed space-y-4 transition-all duration-1000 font-light",
                    fetchingHoroscope ? "opacity-20 blur-md" : "opacity-100"
                  )}>
                    {horoscopeData?.text ? (
                      horoscopeData.text.split('\n\n').map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                      ))
                    ) : (
                      <p>{t("profile.daily_analyzing")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Energy Scores */}
              {horoscopeData?.energyScores && (
                <div className="relative z-10 pt-8 mt-8 border-t border-white/[0.05]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "love", label: t("profile.energy.love") || "Aşk", icon: <Heart className="w-3.5 h-3.5" />, color: "text-rose-400", bg: "bg-rose-500" },
                      { key: "career", label: t("profile.energy.career") || "Kariyer", icon: <Zap className="w-3.5 h-3.5" />, color: "text-amber-400", bg: "bg-amber-500" },
                      { key: "health", label: t("profile.energy.health") || "Sağlık", icon: <Shield className="w-3.5 h-3.5" />, color: "text-emerald-400", bg: "bg-emerald-500" },
                      { key: "spiritual", label: t("profile.energy.spiritual") || "Ruhsal", icon: <Eye className="w-3.5 h-3.5" />, color: "text-violet-400", bg: "bg-violet-500" },
                    ].map(({ key, label, icon, color, bg }) => {
                      const score = Number(horoscopeData.energyScores[key]) || 0;
                      return (
                        <div key={key} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={color}>{icon}</span>
                            <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
                            <span className={cn("ml-auto text-xs font-black", color)}>{score}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                              className={cn("h-full rounded-full", bg)}
                              style={{ opacity: 0.6 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Advice + Lucky Elements + Planet of the Day */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.05] flex flex-col md:flex-row gap-6">
                {/* Advice */}
                <div className="flex-1 flex items-start gap-4">
                  <div className="shrink-0 w-px h-12 bg-gradient-to-b from-purple-500/50 to-transparent hidden sm:block mt-1" />
                  <div>
                    <p className="text-[10px] text-white/10 uppercase tracking-[0.3em] mb-2 font-bold">{t("profile.daily_advice_label")}</p>
                    <p className="text-sm text-purple-300/50 italic leading-relaxed font-serif">
                      &ldquo;{horoscopeData?.advice || t("profile.daily_advice_default")}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Lucky Elements & Planet of the Day */}
                {(horoscopeData?.luckyElements || horoscopeData?.planetOfTheDay) && (
                  <div className="shrink-0 flex flex-row md:flex-col gap-3">
                    {horoscopeData.luckyElements && (
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-white/15 uppercase tracking-widest font-bold">{t("profile.lucky") || "Şanslı"}</span>
                          <span className="text-[11px] text-white/40">
                            <span className="text-amber-400/60">{horoscopeData.luckyElements.color}</span>
                            <span className="text-white/10 mx-1.5">·</span>
                            <span className="text-emerald-400/60">{horoscopeData.luckyElements.number}</span>
                            <span className="text-white/10 mx-1.5">·</span>
                            <span className="text-blue-400/60">{horoscopeData.luckyElements.time}</span>
                          </span>
                        </div>
                      </div>
                    )}
                    {horoscopeData.planetOfTheDay && (
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Orbit className="w-4 h-4 text-indigo-400/50" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-white/15 uppercase tracking-widest font-bold">{t("profile.planet_of_day") || "Günün Gezegeni"}</span>
                          <span className="text-[11px] text-indigo-300/50 font-medium">{horoscopeData.planetOfTheDay.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Zodiac Stats + Personality */}
            {zodiacSign && (
              <>
                {/* Stats Card */}
                <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.03] p-10 overflow-hidden relative group/stats isolate text-left">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover/stats:bg-white/10 transition-all duration-1000" />
                  
                  <SectionLabel>{t("astrology.label.cosmic_stats")}</SectionLabel>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 relative z-10">
                    {/* Planet Visual - Large & Clean */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] group/planet">
                      {(() => {
                        const planetId = normalizePlanetId(zodiacSign.rulingPlanet);
                        const planetData = getPlanetById(planetId);
                        return (
                          <>
                            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border border-white/10 p-1.5 bg-black/40 ring-1 ring-white/5 overflow-hidden">
                              {planetData?.imageUrl && (
                                <img
                                  src={planetData.imageUrl}
                                  alt={zodiacSign.rulingPlanet}
                                  className="w-full h-full object-cover opacity-80 group-hover/planet:opacity-100 transition-all duration-1000 scale-125 group-hover/planet:scale-110 filter brightness-110"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                            <div className="mt-6 text-center">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">{t("astrology.label.planet")}</span>
                              <span className="text-2xl font-serif font-black text-white tracking-tight">{t(zodiacSign.rulingPlanetKey)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Stats Grid - 2x2 Balanced */}
                    <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
                      <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
                          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-3 font-black">{t("astrology.label.element")}</p>
                          <p className="text-xl font-serif font-black text-white flex items-center gap-3">
                            <Waves className="w-5 h-5 text-blue-400 group-hover/stat:scale-110 transition-transform" /> {t(zodiacSign.elementKey)}
                          </p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
                          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-3 font-black">{t("astrology.label.quality")}</p>
                          <p className="text-xl font-serif font-black text-white flex items-center gap-3">
                            <Zap className="w-5 h-5 text-purple-400 group-hover/stat:scale-110 transition-transform" /> {t(zodiacSign.qualityKey)}
                          </p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
                          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-3 font-black">{t("astrology.label.lucky_number")}</p>
                          <p className="text-xl font-serif font-black text-white flex items-center gap-3">
                            <Hash className="w-5 h-5 text-emerald-400 group-hover/stat:scale-110 transition-transform" /> {zodiacSign.luckyNumbers[0]}
                          </p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/20 group/stat relative overflow-hidden">
                          <p className="text-[9px] text-indigo-400/50 uppercase tracking-[0.2em] mb-4 font-black">{t("nav.compatibility")}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {zodiacSign.compatibility.slice(0, 4).map(id => (
                              <button 
                                key={id} 
                                onClick={() => router.push(`/uyumluluk?sign1=${zodiacSign.id}&sign2=${id}`)}
                                className="px-2 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 group/zi"
                                title={t(`zodiac.${id}`)}
                              >
                                <ZodiacIcon signId={id} variant="classic" size={20} glowColor={id === 'akrep' ? '#a855f7' : '#6366f1'} className="text-white/40 group-hover/zi:text-white transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-white/[0.06] relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-px bg-white/20" /> {t("astrology.label.field_of_influence")}
                      </p>
                      <p className="text-sm text-white/50 italic leading-relaxed font-light">
                        &ldquo;{getPlanetById(normalizePlanetId(zodiacSign.rulingPlanet))?.influence || t("profile.planet_influence_default")}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personality Card */}
                <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
                  <SectionLabel>{t("zodiac.detail.section.personality")}</SectionLabel>
                  <p className="text-white/40 text-[13px] leading-relaxed mt-4 line-clamp-[7]">
                    {t(`zodiac.${zodiacSign.id}.personality`)}
                  </p>
                  <button
                    onClick={() => router.push(`/burclar/${zodiacSign.id}`)}
                    className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  >
                    {t("profile.view_full_zodiac") || "Tüm Burç Detaylarını Gör"}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            )}

            {/* Recent Activity */}
            <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
              <SectionLabel>{t("profile.recent_activity")}</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {activities.length > 0 ? (
                  activities.slice(0, 4).map(act => {
                    const tool = ALL_TOOLS.find(t => t.id === act.tool_id);
                    return (
                      <div key={act.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-all group">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5", tool?.color)}>
                          {tool?.icon || act.tool_id[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white/60 truncate uppercase tracking-widest">{tool?.name || "Aktivite"}</p>
                          <p className="text-[10px] text-white/20 truncate mt-0.5">{act.action_details}</p>
                        </div>
                        <span className="text-[9px] text-white/10 font-bold shrink-0 uppercase tracking-tighter">
                          {new Date(act.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 flex items-center justify-center py-10 opacity-20">
                    <p className="text-[10px] italic tracking-[0.3em] uppercase">{t("profile.no_activity")}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ========== SETTINGS DRAWER ========== */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md bg-[#0a0a0f] border-l border-white/[0.06] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-lg font-serif font-bold text-white">{t("profile.settings_title")}</h2>
                  <button onClick={() => setSettingsOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-7">
                  <SectionLabel>{t("profile.section_personal")}</SectionLabel>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_name")}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <Input
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="bg-white/[0.04] border-white/[0.06] h-12 pl-11 rounded-xl text-sm"
                        placeholder={t("profile.placeholder_name")}
                      />
                    </div>
                  </div>

                  {/* Birth date + time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_date")}</label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                        className="bg-white/[0.04] border-white/[0.06] h-12 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_time")}</label>
                      <Input
                        type="time"
                        value={formData.birth_time}
                        onChange={e => setFormData({ ...formData, birth_time: e.target.value })}
                        className="bg-white/[0.04] border-white/[0.06] h-12 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Birth city */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_city")}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <Input
                        value={formData.birth_city}
                        onChange={e => setFormData({ ...formData, birth_city: e.target.value })}
                        className="bg-white/[0.04] border-white/[0.06] h-12 pl-11 rounded-xl text-sm"
                        placeholder={t("profile.placeholder_city")}
                      />
                    </div>
                  </div>

                  <SectionLabel>{t("profile.section_context")}</SectionLabel>

                  {/* Relationship status */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_relationship")}</label>
                    <div className="relative">
                      <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <select
                        className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                        value={formData.relationship_status}
                        onChange={e => setFormData({ ...formData, relationship_status: e.target.value })}
                      >
                        {RELATIONSHIP_KEYS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">{t(opt.key)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Life Focus */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_focus")}</label>
                    <div className="relative">
                      <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <select
                        className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                        value={formData.life_focus}
                        onChange={e => setFormData({ ...formData, life_focus: e.target.value })}
                      >
                        {LIFE_FOCUS_KEYS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">{t(opt.key)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <SectionLabel>{t("profile.section_prefs")}</SectionLabel>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_language")}</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                      <select
                        className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code} className="bg-[#0a0a0f]">{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("profile.btn_save")}
                  </button>
                </form>

                {/* Sign Out */}
                <div className="mt-10 pt-6 border-t border-white/[0.04]">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-medium"
                  >
                    <LogOut className="w-4 h-4" /> {t("profile.sign_out")}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
