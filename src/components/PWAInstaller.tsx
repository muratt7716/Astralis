"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, PlusSquare, ArrowUp, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if already installed (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detect iOS
    const detectIOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(ua);
      setIsIOS(isApple);
    };

    detectIOS();

    // 3. Capture beforeinstallprompt (Chrome / Android / Desktop)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not standalone
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 4. Track successful installs
    const onInstalled = () => {
      fetch('/api/pwa-install', { method: 'POST' }).catch(() => {});
    };
    window.addEventListener("appinstalled", onInstalled);

    // 4. For iOS, we show it manually after a delay or based on logic
    // because there's no event.
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 10000); // Show after 10s for iOS
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isStandalone, isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("pwa-prompt-dismissed")) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[2000]"
        >
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 md:p-6">
            {/* Animated Glow Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/10">
                <img src="/icon-192.png" alt="Astralis" className="w-full h-full object-cover" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white tracking-tight uppercase">Astralis'i Yükle</h4>
                  <button 
                    onClick={handleDismiss}
                    className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Yıldızların rehberliğine anında ulaşmak için Astralis'i ana ekranına ekle.
                </p>
              </div>
            </div>

            {/* Action Area */}
            <div className="mt-5">
              {!isIOS ? (
                // Chrome / Android
                <button
                  onClick={handleInstall}
                  className="w-full h-11 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Download className="w-4 h-4" /> Uygulamayı Yükle
                </button>
              ) : (
                // iOS
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <Share className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-white/70">
                      Önce <span className="font-bold text-white">Paylaş</span> butonuna bas
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-white/70">
                      Sonra <span className="font-bold text-white">Ana Ekran'a Ekle</span>'yi seç
                    </span>
                  </div>
                  <div className="flex justify-center pt-1 animate-bounce">
                    <ArrowUp className="w-4 h-4 text-white/30" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Tagline */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-500/50" />
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Hızlı & Hafif Deneyim</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
