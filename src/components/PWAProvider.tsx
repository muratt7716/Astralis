"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sadece tarayıcı ortamında ve SW destekleniyorsa çalıştır
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("[PWA] ServiceWorker registered:", registration.scope);
        } catch (error) {
          console.error("[PWA] ServiceWorker registration failed:", error);
        }
      };

      // Performans ve Next.js Hydration uyumu için:
      // Sayfa zaten tamamen yüklendiyse hemen kaydet, 
      // yüklenmediyse 'load' eventini bekle ki sayfanın ilk açılış hızını kesmesin.
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