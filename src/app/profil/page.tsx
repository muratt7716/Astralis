"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { useAuth, uploadAvatar } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n";

// SWR Fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API fetch failed');
  return res.json();
};
import { compressImage } from "@/lib/image-utils";
import { getZodiacByDate } from "@/data/zodiac";
import { calculateBirthChart } from "@/lib/astrology";

// Components
import { ProfileHero } from "@/components/Profile/ProfileHero";
import { DailyInsight } from "@/components/Profile/DailyInsight";
import { CosmicStats } from "@/components/Profile/CosmicStats";
import { ActiveGuideCard } from "@/components/Profile/ActiveGuideCard";
import { ActivityFeed, ActivityDetailModal } from "@/components/Profile/ActivityFeed";
import { SettingsDrawer } from "@/components/Profile/SettingsDrawer";
import { Toast } from "@/components/Profile/ProfileUI";

// Constants
import { GUIDES } from "@/components/Profile/ProfileConstants";

// ============================
// MAIN COMPONENT
// ============================

export default function ProfilePage() {
  const router = useRouter();
  const { t, dir } = useTranslation();
  const { user, profile, loading: authLoading, profileLoading, signOut, mergeProfile } = useAuth() as any;

  const [saving, setSaving] = useState(false);
  // Date for SWR Key (Europe/Istanbul)
  const today = useMemo(() => new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Istanbul'
  }).format(new Date()).split('.').reverse().join('-'), []);

  // SWR Hooks
  const { data: horoscopeRes, isValidating: fetchingHoroscope } = useSWR(
    user?.id ? `/api/ai/daily-horoscope?userId=${user.id}&lang=${profile?.language || 'tr'}&d=${today}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const { data: activityRes, mutate: mutateActivity } = useSWR(
    user?.id ? `/api/user/activity?userId=${user.id}&limit=5` : null,
    fetcher
  );

  const { data: toolsRes } = useSWR(
    user?.id ? `/api/user/top-tools?userId=${user.id}` : null,
    fetcher
  );

  // Derived data
  const horoscopeData = useMemo(() => horoscopeRes?.horoscope || horoscopeRes, [horoscopeRes]);
  const activities = useMemo(() => activityRes?.activities || (Array.isArray(activityRes) ? activityRes : []), [activityRes]);
  const topToolIds = useMemo(() => toolsRes?.toolIds || [], [toolsRes]);

  // UI States (Restored)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    birth_time: "",
    birth_city: "",
    relationship_status: "single",
    life_focus: "general",
    language: "tr",
  });

  // Sync form data only when drawer opens, not continuously
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/onboarding");
      return;
    }
    // If logged in, but profile is not loading and profile is null, force onboarding
    if (!authLoading && user && !profileLoading && !profile) {
      router.push("/onboarding");
    }
  }, [user, profile, authLoading, profileLoading, router]);

  useEffect(() => {
    // Only sync form when settings drawer opens to prevent save loop
    if (settingsOpen && profile && !saving) {
      setFormData({
        full_name: profile.full_name || "",
        birth_date: profile.birth_date || "",
        birth_time: profile.birth_time || "",
        birth_city: profile.birth_city || "",
        relationship_status: profile.relationship_status || "single",
        life_focus: profile.life_focus || "general",
        language: profile.language || "tr",
      });
    }
  }, [settingsOpen, profile, saving]);

  // Derived Data
  const zodiacSign = useMemo(() => {
    const dDate = profile?.birth_date;
    if (!dDate) return null;
    const d = new Date(dDate);
    return getZodiacByDate(d.getMonth() + 1, d.getDate());
  }, [profile?.birth_date]);

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
  }, [profile]);

  const risingSignName = birthChart?.risingSign?.name || profile?.rising_sign || null;
  const risingSignId = birthChart?.risingSign?.id || null;
  const moonSignName = birthChart?.moonSign?.name || profile?.moon_sign || null;
  const moonSignId = birthChart?.moonSign?.id || null;

  const activeGuide = useMemo(() =>
    GUIDES.find(g => g.id === (profile?.selected_guide_id || "melisa")) || GUIDES[0],
    [profile?.selected_guide_id]);

  if (!profile && authLoading) {
    return <div className="min-h-screen bg-[#050508] flex items-center justify-center text-white/20">Loading...</div>;
  }

  if (!profile && !authLoading) return null;

  // Handlers
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optimistic preview
      setSelectedAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        const optimized = await compressImage(file);
        const avatarUrl = await uploadAvatar(optimized);
        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
        mergeProfile({ avatar_url: avatarUrl });
        showToast(t("profile.saved") || "Profil resmi güncellendi!");
      } catch (err: any) {
        console.error("Avatar upload issue:", err);
        showToast("Hata: " + err.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (selectedAvatar) {
        const optimized = await compressImage(selectedAvatar);
        avatarUrl = await uploadAvatar(optimized);
      }
      const { error } = await supabase
        .from("profiles")
        .update({ ...formData, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      mergeProfile({ ...formData, avatar_url: avatarUrl });
      showToast(t("profile.saved"));
      setSettingsOpen(false);
    } catch (err: any) {
      showToast("Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const normalizePlanetId = (name: string) => {
    const map: Record<string, string> = { "güneş": "gunes", "ay": "ay", "merkür": "merkur", "venüs": "venus", "mars": "mars", "jüpiter": "jupiter", "satürn": "saturn", "uranüs": "uranus", "neptün": "neptun", "plüton": "pluton" };
    return map[name.toLowerCase()] || name.toLowerCase();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-purple-500/30 font-sans pb-24 overflow-x-hidden" dir={dir}>
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-50%] w-full h-full bg-indigo-500/5 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-50%] w-full h-full bg-purple-500/5 blur-[120px] rounded-full animate-pulse-slow delay-700" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pt-32 md:pt-40">
        <ProfileHero
          profile={profile}
          zodiacSign={zodiacSign}
          risingSignName={risingSignName}
          risingSignId={risingSignId}
          moonSignName={moonSignName}
          moonSignId={moonSignId}
          onSettingsOpen={() => setSettingsOpen(true)}
          onSignOut={signOut}
          previewUrl={previewUrl}
          onAvatarChange={handleAvatarChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ActiveGuideCard
            activeGuide={activeGuide}
            activeGuideId={profile.selected_guide_id || "melisa"}
            onStartChat={() => router.push(`/mistik-rehber/chat/${activeGuide.id}`)}
            onChangeGuide={() => router.push("/mistik-rehber")}
          />

          <div className="lg:col-span-8 space-y-6">
            <DailyInsight
              horoscopeData={horoscopeData}
              fetchingHoroscope={fetchingHoroscope}
              dir={dir}
            />

            <CosmicStats
              zodiacSign={zodiacSign}
              normalizePlanetId={normalizePlanetId}
            />

            <ActivityFeed
              activities={activities}
              onSelectActivity={setSelectedActivity}
              mutate={mutateActivity}
            />
          </div>
        </div>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
        onSave={handleSave}
        onSignOut={signOut}
      />

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
