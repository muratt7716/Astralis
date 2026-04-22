"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-helpers";

const STORAGE_KEY = "astralis_freemium_v1";
const MISTIK_KEY = "astralis_mistik_v1";
const FREE_TOOL_LIMIT = 1; // per day per tool
export const FREE_MISTIK_MESSAGES = 5; // total free messages per guide

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
  const today = getTodayKey();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...usage, date: today }));
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

// ── Reset countdown (ms until midnight) ───────────────────────────────────

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

// ── Main hook ──────────────────────────────────────────────────────────────

export function useFreemiumQuota(toolKey: string) {
  const { profile, loading } = useAuth();
  const isPremium = profile?.is_premium ?? false;

  const [quotaUsed, setQuotaUsed] = useState(false);
  const [msUntilReset, setMsUntilReset] = useState(getMsUntilMidnight());

  // Init quota state from localStorage
  useEffect(() => {
    if (loading || isPremium) return;
    const usage = getTodayUsage();
    setQuotaUsed((usage[toolKey] ?? 0) >= FREE_TOOL_LIMIT);
  }, [toolKey, isPremium, loading]);

  // Live countdown tick (every second)
  useEffect(() => {
    const id = setInterval(() => {
      const ms = getMsUntilMidnight();
      setMsUntilReset(ms);
      // Auto-reset quota when new day starts
      if (ms < 1000) {
        setQuotaUsed(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Try to consume 1 quota unit. Returns true if allowed.
  const consumeQuota = useCallback((): boolean => {
    if (isPremium) return true;
    const usage = getTodayUsage();
    const count = usage[toolKey] ?? 0;
    if (count >= FREE_TOOL_LIMIT) return false;
    usage[toolKey] = count + 1;
    saveTodayUsage(usage);
    setQuotaUsed(count + 1 >= FREE_TOOL_LIMIT);
    return true;
  }, [isPremium, toolKey]);

  return {
    isPremium,
    quotaUsed: !isPremium && quotaUsed,
    consumeQuota,
    msUntilReset,
    resetTimeStr: formatResetTime(msUntilReset),
    loading,
  };
}
