"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      
      const cleanAndRegister = async () => {
        // 1. Önce cihazdaki tüm eski kayıtları zorla sil (Unregister)
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
            console.log("[PWA] Eski SW silindi.");
          }

          // 2. Cache storage'ı tamamen boşalt
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log("[PWA] Cache temizlendi.");

          // 3. Şimdi yeni sw.js'i kaydet (v6 parametresi ile cache kırma)
          const reg = await navigator.serviceWorker.register("/sw.js?v=6");
          console.log("[PWA] Yeni SW kaydedildi:", reg.scope);
        } catch (err) {
          console.error("[PWA] PWA Cleanup/Register hatası:", err);
        }
      };

      // Performans için load eventini bekle
      if (document.readyState === "complete") {
        cleanAndRegister();
      } else {
        window.addEventListener("load", cleanAndRegister);
      }
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}