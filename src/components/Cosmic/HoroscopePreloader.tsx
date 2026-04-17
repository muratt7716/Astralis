"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";

/**
 * HoroscopePreloader
 * Fires a silent fetch to the daily-horoscope API as soon as the user logs in.
 * This ensures the data is ready (and cached) when they hit the profile page.
 */
export default function HoroscopePreloader() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const lastFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Use Turkey time for the "today" key to match the server logic
    const today = new Intl.DateTimeFormat('tr-TR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(new Date()).split('.').reverse().join('-');

    const fetchKey = `${user.id}-${today}-${profile?.language || 'tr'}`;

    if (lastFetchRef.current === fetchKey) return;
    lastFetchRef.current = fetchKey;

    async function preload() {
      try {
        // Silent fetch - we don't need to wait or handle result here,
        // it just triggers the server-side generation/caching.
        fetch(`/api/ai/daily-horoscope?userId=${user.id}`);
        console.log("Cosmic Preloader: Daily horoscope sync started in background.");
      } catch (err) {
        console.warn("Preloader failed silently", err);
      }
    }

    preload();
  }, [user?.id, profile?.language]);

  return null;
}
