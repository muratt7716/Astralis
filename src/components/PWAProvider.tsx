"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Tüm eski SW'leri temizle, yeni kayıt yok (test modu)
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
    caches.keys().then(keys => {
      keys.forEach(k => caches.delete(k));
    });
  }, []);

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}
