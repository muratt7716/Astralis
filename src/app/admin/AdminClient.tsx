"use client";

import { useState, useTransition } from "react";
import { grantPremium, revokePremium } from "./actions";
import { Crown, Search, ShieldCheck, ShieldX, User, Calendar, Loader2, CheckCircle, XCircle } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  is_premium: boolean;
  subscription_type: string | null;
  subscription_end_date: string | null;
}

interface AdminClientProps {
  users: UserRow[];
  adminEmail: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function UserCard({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const handle = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await action();
        setFeedback("success");
        setTimeout(() => setFeedback(null), 2000);
      } catch {
        setFeedback("error");
        setTimeout(() => setFeedback(null), 2000);
      }
    });
  };

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 p-5 ${
      user.is_premium
        ? "bg-purple-950/20 border-purple-500/20"
        : "bg-white/[0.02] border-white/[0.06]"
    }`}>
      {/* Feedback flash */}
      {feedback && (
        <div className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 ${
          feedback === "success" ? "bg-green-500/10" : "bg-red-500/10"
        }`}>
          {feedback === "success"
            ? <CheckCircle className="w-8 h-8 text-green-400" />
            : <XCircle className="w-8 h-8 text-red-400" />
          }
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: user info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            user.is_premium ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5 border border-white/10"
          }`}>
            {user.is_premium
              ? <Crown className="w-4 h-4 text-purple-400" />
              : <User className="w-4 h-4 text-white/40" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {user.is_premium ? (
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  {user.subscription_type === "lifetime" ? "⭐ Lifetime" : "💜 Monthly"}
                </span>
              ) : (
                <span className="text-[10px] text-white/25 uppercase tracking-wider">Free</span>
              )}
              {user.subscription_end_date && (
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatDate(user.subscription_end_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
          ) : user.is_premium ? (
            <button
              onClick={() => handle(() => revokePremium(user.id))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
            >
              <ShieldX className="w-3.5 h-3.5" />
              İptal
            </button>
          ) : (
            <>
              <button
                onClick={() => handle(() => grantPremium(user.id, "monthly"))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Monthly
              </button>
              <button
                onClick={() => handle(() => grantPremium(user.id, "lifetime"))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                Lifetime
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClient({ users, adminEmail }: AdminClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "premium" ? u.is_premium : !u.is_premium);
    return matchSearch && matchFilter;
  });

  const premiumCount = users.filter((u) => u.is_premium).length;
  const freeCount = users.length - premiumCount;

  return (
    <div className="min-h-screen bg-[#050508] pt-28 pb-16 px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-white/30 text-xs ml-11">{adminEmail}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Toplam", value: users.length, color: "text-white" },
            { label: "Premium", value: premiumCount, color: "text-purple-400" },
            { label: "Free", value: freeCount, color: "text-white/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="E-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 transition-colors"
            />
          </div>
          <div className="flex rounded-xl border border-white/[0.06] overflow-hidden">
            {(["all", "premium", "free"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {f === "all" ? "Tümü" : f === "premium" ? "Premium" : "Free"}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-sm">Kullanıcı bulunamadı</div>
          ) : (
            filtered.map((user) => <UserCard key={user.id} user={user} />)
          )}
        </div>
      </div>
    </div>
  );
}
