"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          // MOBİL İÇİN KRİTİK: Eski sistemden kalan ?v=6 gibi parametreli SW'leri temizle
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let reg of registrations) {
            if (reg.active?.scriptURL.includes('?')) {
              console.log("[PWA] Eski parametreli SW temizleniyor:", reg.active.scriptURL);
              await reg.unregister();
            }
          }

          // Yeni temiz kayıt
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("[PWA] Servis Çalışanı aktif:", registration.scope);

          const updateSW = () => {
             registration.update().catch(() => {}); // Hataları sessizce geç
          };

          window.addEventListener('focus', updateSW);
          updateSW();

          return () => window.removeEventListener('focus', updateSW);
        } catch (err) {
          console.error("[PWA] Kayıt hatası:", err);
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
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