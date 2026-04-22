"use client";

import { Clock, Infinity, Sparkles } from "lucide-react";
import { useFreemiumQuota } from "@/lib/freemium";

interface FreemiumBadgeProps {
  toolKey: string;
}

export default function FreemiumBadge({ toolKey }: FreemiumBadgeProps) {
  const { isPremium, quotaUsed, resetTimeStr, loading } = useFreemiumQuota(toolKey);

  if (loading) return null;

  if (isPremium) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-medium">
        <Infinity className="w-3 h-3" />
        Sınırsız Kullanım
      </div>
    );
  }

  if (quotaUsed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
        <Clock className="w-3 h-3" />
        <span className="font-mono tabular-nums">{resetTimeStr}</span>
        <span className="text-amber-400/70">sonra yenilenir</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
      <Sparkles className="w-3 h-3" />
      Bugün 1 ücretsiz hakkınız var
    </div>
  );
}
