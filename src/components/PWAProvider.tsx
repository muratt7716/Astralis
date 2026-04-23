"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        registration.update().catch(() => {});
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
