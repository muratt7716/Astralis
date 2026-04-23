"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

// Bu versiyon sw.js içindeki CACHE_NAME ile eşleşmeli
const CURRENT_CACHE = 'astralis-v9';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        // Mevcut SW versiyonu doğru mu kontrol et
        const hasCurrentVersion = await caches.has(CURRENT_CACHE);

        if (!hasCurrentVersion && registrations.length > 0) {
          // Eski/bozuk SW ve cache'leri tamamen temizle (kullanıcı müdahalesi gerekmez)
          await Promise.all(registrations.map(r => r.unregister()));
          const allCaches = await caches.keys();
          await Promise.all(allCaches.map(key => caches.delete(key)));
        }

        const registration = await navigator.serviceWorker.register("/sw.js");

        // Sekme focus'a gelince güncelleme kontrolü
        const checkUpdate = () => registration.update().catch(() => {});
        window.addEventListener('focus', checkUpdate);
        checkUpdate();

        return () => window.removeEventListener('focus', checkUpdate);
      } catch (err) {
        console.error("[PWA] Kayıt hatası:", err);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}
