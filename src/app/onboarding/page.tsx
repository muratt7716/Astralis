"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingForm } from "@/components/Cosmic/OnboardingForm";
import { useAuth, signInWithGoogleIdToken, updateProfile, uploadAvatar } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import { GoogleLogin } from '@react-oauth/google';
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/image-utils";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery";

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </svg>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language, dir } = useTranslation();
  const isRTL = dir === "rtl";
  const { user, profile, loading: authLoading, profileLoading } = useAuth() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [hasStartedProfileFetch, setHasStartedProfileFetch] = useState(false);

  useEffect(() => {
    if (user && profileLoading) {
      setHasStartedProfileFetch(true);
    }
    // If we've started a fetch, and it completes, but profile is null, show form
    if (hasStartedProfileFetch && !profileLoading && !profile && isLoginProcessing) {
      setIsLoginProcessing(false);
    }
  }, [user, profileLoading, profile, hasStartedProfileFetch, isLoginProcessing]);

  useEffect(() => {
    if (!authLoading && user && profile) {
      router.push("/profil");
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || profileLoading || isLoginProcessing || (user && profile)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  const handleOnboardingSubmit = async (formData: any) => {
    if (!user) {
      alert(t("onboarding.error.auth"));
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = user.user_metadata?.avatar_url;

      if (selectedAvatar) {
        const optimizedFile = await compressImage(selectedAvatar);
        avatarUrl = await uploadAvatar(optimizedFile);
      }

      await updateProfile({
        full_name: formData.username,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        birth_city: formData.birthCity,
        relationship_status: formData.relationshipStatus,
        life_focus: formData.lifeFocus,
        avatar_url: avatarUrl
      });

      document.cookie = `has-profile=true; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;

      router.push("/mistik-rehber");
    } catch (error: any) {
      alert(t("onboarding.error.generic") + " " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setIsLoginProcessing(true);
    try {
      await signInWithGoogleIdToken(credential);
    } catch (error: any) {
      alert(t("auth.error.google") + " " + error.message);
      setIsLoginProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden ${isRTL ? "rtl" : "ltr"}`} dir={dir}>
      {/* 3D Cosmic Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none lg:pointer-events-auto">
        <Canvas camera={{ position: [-12, 1.5, 12], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Suspense fallback={null}>
            <group position={[0, -1, 0]}>
              <ParticleSphere showSigns={false} />
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

      {/* Radial Glow Overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full z-0" />
      
      {!user ? (
        <div className="relative z-10 w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl text-center space-y-8 shadow-2xl">
          <div className="space-y-4">
             <h1 className="text-4xl font-brand font-bold text-white tracking-tight">{t("auth.login.title")}</h1>
             <p className="text-gray-400">{t("auth.login.subtitle")}</p>
          </div>
          
          
          <div className="flex justify-center w-full playfair-btn-wrapper">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleLogin(credentialResponse.credential);
                }
              }}
              onError={() => {
                console.error("Google Auth Başarısız");
              }}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="320"
            />
          </div>

          <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
            {t("auth.terms.part1")}{" "}
            <Link href="/kullanim-kosullari" className="underline hover:text-white transition-colors duration-300">
              {t("auth.terms.terms")}
            </Link>{" "}
            {t("auth.terms.part2")}{" "}
            <Link href="/gizlilik" className="underline hover:text-white transition-colors duration-300">
              {t("auth.terms.privacy")}
            </Link>{" "}
            {t("auth.terms.part3")}
          </p>
        </div>
      ) : (
        <OnboardingForm
          className="relative z-10"
          imageSrc="https://images.pexels.com/photos/16880954/pexels-photo-16880954.jpeg"
          title={t("onboarding.title")}
          description={t("onboarding.desc")}
          avatarFallback={user.email?.[0].toUpperCase()}
          avatarSrc={user.user_metadata?.avatar_url}
          inputPlaceholder={t("onboarding.username.placeholder")}
          buttonText={t("onboarding.btn.submit")}
          onAvatarChange={setSelectedAvatar}
          onFormSubmit={handleOnboardingSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
