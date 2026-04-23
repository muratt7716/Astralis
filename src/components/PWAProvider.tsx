"use client";

import React, { useEffect } from "react";
import PWAInstaller from "./PWAInstaller";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] ServiceWorker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] ServiceWorker registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}
