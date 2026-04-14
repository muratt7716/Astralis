"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

interface ClientHoroscopeCardProps {
  signId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

export default function ClientHoroscopeCard({ signId, period }: ClientHoroscopeCardProps) {
  const { t, language } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [shouldFetch, setShouldFetch] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldFetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldFetch) return;
    let isMounted = true;
    setLoading(true);
    setError(false);

    // Fetch horoscope from API
    fetch(`/api/horoscope/${signId}?period=${period}&lang=${language}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data?.horoscope) {
          setData(json.data.horoscope);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [shouldFetch, signId, period, language]);

  if (loading) {
    return (
      <div ref={cardRef} className="glass-card p-6 md:p-8 animate-pulse text-center min-h-[300px]">
        <h3 className="text-xl font-bold text-white mb-4">✨ {t("chart.interpreting")}</h3>
        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-5/6 mb-4"></div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="h-16 bg-white/5 rounded-lg"></div>
          <div className="h-16 bg-white/5 rounded-lg"></div>
          <div className="h-16 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div ref={cardRef} className="glass-card p-6 md:p-8 border-red-500/30 text-center min-h-[300px]">
        <p className="text-red-400">{t("error.connection")}</p>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="glass-card p-6 md:p-8 relative overflow-hidden group min-h-[300px]">
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
      
      <p className="text-gray-300 leading-relaxed mb-6 font-medium relative z-10">{data.content}</p>

      <div className="grid md:grid-cols-3 gap-3 relative z-10">
        <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 hover:border-pink-500/30 transition-colors">
          <p className="text-pink-400 text-sm font-semibold mb-2">💕 {t("horoscope.love")}</p>
          <p className="text-gray-400 text-sm">{data.love}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
          <p className="text-blue-400 text-sm font-semibold mb-2">💼 {t("horoscope.career")}</p>
          <p className="text-gray-400 text-sm">{data.career}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 hover:border-green-500/30 transition-colors">
          <p className="text-green-400 text-sm font-semibold mb-2">🏥 {t("horoscope.health")}</p>
          <p className="text-gray-400 text-sm">{data.health}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
        <span className="text-gray-500 text-sm font-medium">
          {t("horoscope.lucky")}: <span className="text-purple-400 text-lg">{data.luckyNumber}</span>
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-lg ${i < (data.rating || 3) ? "opacity-100" : "opacity-20 grayscale"}`}>
              ⭐
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
