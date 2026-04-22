"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-helpers";

const STORAGE_KEY = "astralis_freemium_v1";
const MISTIK_KEY = "astralis_mistik_v1";
const FREE_TOOL_LIMIT = 1; // per day per tool
export const FREE_MISTIK_MESSAGES = 5;

// ── Storage helpers ────────────────────────────────────────────────────────

function getStoredUsage(): Record<string, any> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayUsage(): Record<string, number> {
  const stored = getStoredUsage();
  const today = getTodayKey();
  if (stored.date !== today) return {};
  return stored;
}

function saveTodayUsage(usage: Record<string, any>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...usage, date: getTodayKey() })
  );
}

// ── Mistik Rehber message counter ─────────────────────────────────────────

export function getMistikMessageCount(guideId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(MISTIK_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return stored[guideId] ?? 0;
  } catch {
    return 0;
  }
}

export function incrementMistikMessageCount(guideId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(MISTIK_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    const next = (stored[guideId] ?? 0) + 1;
    stored[guideId] = next;
    localStorage.setItem(MISTIK_KEY, JSON.stringify(stored));
    return next;
  } catch {
    return 0;
  }
}

// ── Reset countdown ────────────────────────────────────────────────────────

export function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function formatResetTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}s ${m}dk`;
  if (m > 0) return `${m}dk ${s}sn`;
  return `${s}sn`;
}

// ── Multi-tool overview ───────────────────────────────────────────────────

export const FEATURE_KEYS = [
  { id: 'dogum-haritasi', label: 'Doğum Haritası', isPremiumOnly: true },
  { id: 'uyumluluk', label: 'Aşk ve Uyumluluk', isPremiumOnly: false },
  { id: 'ruya-analizi', label: 'Rüya Analizi', isPremiumOnly: false },
  { id: 'horary', label: 'Soru Astrolojisi', isPremiumOnly: true },
  { id: 'biyoritim', label: 'Biyoritim Uzmanı', isPremiumOnly: false },
  { id: 'numeroloji', label: 'Numeroloji', isPremiumOnly: true },
  { id: 'kristal', label: 'Kristal Küre', isPremiumOnly: false },
  { id: 'iching', label: 'I-Ching', isPremiumOnly: false },
  { id: 'runler', label: 'Runik Kehanet', isPremiumOnly: false }
];

export function getAllToolQuotas() {
  if (typeof window === "undefined") return [];
  const usage = getTodayUsage();
  return FEATURE_KEYS.map(f => ({
    ...f,
    used: (usage[f.id] ?? 0) >= FREE_TOOL_LIMIT,
    limit: FREE_TOOL_LIMIT,
    count: usage[f.id] ?? 0
  }));
}

// ── Main hook ──────────────────────────────────────────────────────────────
//
// Key concepts:
//   quotaUsedToday  — persistent: has the user used their quota today?
//                     Used for badge display.
//   sessionActive   — component-local: has the user consumed quota THIS session?
//                     Once true, all subsequent actions in the same component
//                     lifecycle are allowed (prevents mid-flow blocks).
//   isBlocked       — true only when quota exhausted AND no active session.
//                     Use this for action guards.

export function useFreemiumQuota(toolKey: string) {
  const { profile, loading } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const isPremiumOnly = FEATURE_KEYS.find(f => f.id === toolKey)?.isPremiumOnly ?? false;

  const [quotaUsedToday, setQuotaUsedToday] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [msUntilReset, setMsUntilReset] = useState(getMsUntilMidnight());

  // Read quota from localStorage once profile is ready
  useEffect(() => {
    if (loading || isPremium || isPremiumOnly) return;
    const usage = getTodayUsage();
    setQuotaUsedToday((usage[toolKey] ?? 0) >= FREE_TOOL_LIMIT);
  }, [toolKey, isPremium, loading]);

  // Live countdown + auto-reset at midnight
  useEffect(() => {
    const id = setInterval(() => {
      const ms = getMsUntilMidnight();
      setMsUntilReset(ms);
      if (ms < 1000) {
        setQuotaUsedToday(false);
        setSessionActive(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Consume 1 quota unit. Returns true if the action should proceed.
  // Idempotent: safe to call multiple times in the same session.
  const consumeQuota = useCallback((): boolean => {
    if (isPremium) return true;
    if (sessionActive) return true; // already started this session

    const usage = getTodayUsage();
    const count = usage[toolKey] ?? 0;
    if (count >= FREE_TOOL_LIMIT) return false;

    usage[toolKey] = count + 1;
    saveTodayUsage(usage);
    setQuotaUsedToday(count + 1 >= FREE_TOOL_LIMIT);
    setSessionActive(true);
    return true;
  }, [isPremium, toolKey, sessionActive]);

  return {
    isPremium,
    isPremiumOnly,
    /** Use for action guards: blocks only when quota gone AND no active session */
    isBlocked: isPremiumOnly ? !isPremium : (!isPremium && !sessionActive && quotaUsedToday),
    /** Use for badge display: shows timer when quota was used today */
    quotaUsed: !isPremium && quotaUsedToday,
    consumeQuota,
    msUntilReset,
    resetTimeStr: formatResetTime(msUntilReset),
    loading,
  };
}
