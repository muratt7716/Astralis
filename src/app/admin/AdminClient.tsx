"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { grantPremium, revokePremium } from "./actions";
import {
  Crown, Search, ShieldCheck, ShieldX, User, Calendar, Loader2,
  CheckCircle, XCircle, Infinity, Repeat, Smartphone, Users,
  TrendingUp, AlertTriangle, Percent, Star, Zap, Activity,
  Wallet, Sparkles, Clock, X, ChevronRight, Mail,
  type LucideIcon,
} from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_premium: boolean;
  subscription_type: string | null;
  subscription_end_date: string | null;
}

interface AdminClientProps {
  users: UserRow[];
  adminEmail: string;
  pwaInstallCount: number;
  newUsersThisWeek: number;
  activeUsers24h: number;
  estimatedMRR: number;
  expiringUsers: UserRow[];
  dailySignups: { date: string; count: number }[];
  sunSignDistribution: { sign: string; count: number }[];
  topFortuneTypes: { type: string; count: number }[];
  monthlyPremiumCount: number;
  lifetimePremiumCount: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDay(dateStr: string) {
  return new Date(dateStr + "T12:00:00")
    .toLocaleDateString("tr-TR", { weekday: "short" })
    .slice(0, 3);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins}d önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}g önce`;
  return formatDate(iso);
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, delay, ease: EASE } },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, iconClass, borderClass, delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  iconClass: string;
  borderClass: string;
  delay: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`rounded-2xl border bg-white/[0.025] p-4 flex flex-col gap-3 ${borderClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${iconClass}`} />
      </div>
      <p className={`text-[26px] md:text-3xl font-bold tabular-nums leading-none ${iconClass}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/25 -mt-1.5">{sub}</p>}
    </motion.div>
  );
}

// ─── Weekly Chart ─────────────────────────────────────────────────────────────

function WeeklyChart({ dailySignups }: { dailySignups: { date: string; count: number }[] }) {
  const maxCount = Math.max(...dailySignups.map((d) => d.count), 1);
  const total = dailySignups.reduce((a, d) => a + d.count, 0);

  return (
    <motion.div {...fadeUp(0.25)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white/75">7 Günlük Kayıt</h3>
        </div>
        <span className="text-xs font-bold text-white/40 tabular-nums">{total} toplam</span>
      </div>

      <div className="flex items-end gap-1.5 h-[72px]">
        {dailySignups.map((day, i) => {
          const pxH = Math.max((day.count / maxCount) * 64, day.count > 0 ? 12 : 3);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.055 + 0.3, duration: 0.3, ease: EASE }}
                  style={{ height: pxH, transformOrigin: "bottom" }}
                  className="w-full rounded-t-sm bg-gradient-to-t from-violet-600 to-purple-400"
                />
              </div>
              <span className="text-[9px] text-white/25 font-medium">{formatDay(day.date)}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Premium Breakdown ────────────────────────────────────────────────────────

function PremiumBreakdown({
  monthlyCount, lifetimeCount, sunSignDistribution,
}: {
  monthlyCount: number;
  lifetimeCount: number;
  sunSignDistribution: { sign: string; count: number }[];
}) {
  const total = monthlyCount + lifetimeCount;

  return (
    <motion.div {...fadeUp(0.3)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-5">
        <Crown className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white/75">Premium Dağılım</h3>
      </div>

      <div className="space-y-3.5 mb-5">
        {[
          { label: "Aylık", icon: Repeat, count: monthlyCount, gradient: "from-violet-600 to-purple-400", textClass: "text-violet-400" },
          { label: "Lifetime", icon: Infinity, count: lifetimeCount, gradient: "from-amber-500 to-yellow-400", textClass: "text-amber-400" },
        ].map((item, i) => {
          const Icon = item.icon;
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] flex items-center gap-1.5 text-white/45">
                  <Icon className="w-3 h-3" />
                  {item.label}
                </span>
                <span className={`text-[11px] font-bold tabular-nums ${item.textClass}`}>{item.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, delay: 0.35 + i * 0.1, ease: EASE }}
                  className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {sunSignDistribution.length > 0 && (
        <div className="border-t border-white/[0.04] pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3 h-3 text-amber-500/50" />
            <span className="text-[10px] text-white/25 uppercase tracking-widest">En Yaygın Burçlar</span>
          </div>
          <div className="space-y-2">
            {sunSignDistribution.map((entry, i) => {
              const pct = (entry.count / sunSignDistribution[0].count) * 100;
              return (
                <div key={entry.sign} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/40 w-14 shrink-0 truncate">{entry.sign}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.45, delay: 0.45 + i * 0.07, ease: EASE }}
                      className="h-full rounded-full bg-violet-500/40"
                    />
                  </div>
                  <span className="text-[10px] text-white/25 w-5 text-right tabular-nums">{entry.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Popular Fortune Types ────────────────────────────────────────────────────

function PopularFortunes({ items }: { items: { type: string; count: number }[] }) {
  const maxCount = items[0]?.count ?? 1;

  return (
    <motion.div {...fadeUp(0.35)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-white/75">Popüler Araçlar</h3>
        </div>
        <span className="text-[10px] text-white/25 uppercase tracking-widest">30 gün</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-white/20 text-xs">Henüz veri yok</div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const pct = (item.count / maxCount) * 100;
            return (
              <div key={item.type} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-white/55 font-medium">{item.type}</span>
                  <span className="text-[11px] font-bold tabular-nums text-white/70">{item.count}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: 0.45 + i * 0.06, ease: EASE }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Expiring Banner ──────────────────────────────────────────────────────────

function ExpiringBanner({ expiringUsers }: { expiringUsers: UserRow[] }) {
  const [open, setOpen] = useState(true);
  if (!open || expiringUsers.length === 0) return null;

  return (
    <motion.div {...fadeUp(0.4)} className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-300">
              {expiringUsers.length} abonelik 7 gün içinde bitiyor
            </p>
            <p className="text-[11px] text-white/35 mt-0.5 truncate">
              {expiringUsers.map((u) => u.email).join(", ")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white/20 hover:text-white/50 transition-colors p-1 shrink-0"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

interface ActivityLog {
  action_type: string;
  description: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  // Tools
  tarot: "Tarot",
  dream: "Rüya",
  horary: "Horary",
  synastry: "Uyumluluk",
  compatibility: "Uyumluluk",
  birthchart: "Doğum Haritası",
  birth_chart: "Doğum Haritası",
  numerology: "Numeroloji",
  numerology_synthesis_analyze: "Numeroloji",
  bio: "Biyoritim",
  biorhythm_analyze: "Biyoritim",
  biorhythm_synergy_analyze: "Biyoritim",
  sphere: "Kristal Küre",
  iching: "I-Ching",
  runler: "Rünler",
  kahve: "Kahve",
  // Navigation / views (shown in modal timeline)
  profile_visit: "Profil Ziyareti",
  guide_gallery_visit: "Rehber Galerisi",
  zodiac_list: "Burç Listesi",
  horoscope_view: "Burç Yorumu",
  compatibility_view: "Uyumluluk Görüntüleme",
  birth_chart_view: "Doğum Haritası Görüntüleme",
};

function UserDetailModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/admin/user-activity?userId=${user.id}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]));
    return () => ctrl.abort();
  }, [user.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.26, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-white/[0.08] bg-[#0a0a12] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] md:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              user.is_premium
                ? "bg-purple-500/15 border border-purple-500/25"
                : "bg-white/[0.04] border border-white/[0.08]"
            }`}>
              {user.is_premium
                ? <Crown className="w-3.5 h-3.5 text-purple-400" />
                : <User className="w-3.5 h-3.5 text-white/40" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Kullanıcı Detayı</p>
              <p className="text-[10px] text-white/30 truncate">{user.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Info rows */}
          <div className="space-y-2.5">
            <DetailRow icon={Mail} label="E-posta" value={user.email} />
            <DetailRow icon={Calendar} label="Kayıt Tarihi" value={formatDate(user.created_at)} />
            <DetailRow
              icon={Clock}
              label="Son Giriş"
              value={user.last_sign_in_at ? timeAgo(user.last_sign_in_at) : "Hiç"}
              mono={!!user.last_sign_in_at}
            />
            <DetailRow
              icon={Crown}
              label="Abonelik"
              value={
                user.is_premium
                  ? user.subscription_type === "lifetime"
                    ? "Lifetime"
                    : `Aylık · ${formatDate(user.subscription_end_date)} sonuna kadar`
                  : "Ücretsiz"
              }
              valueClass={user.is_premium ? "text-purple-300" : "text-white/60"}
            />
          </div>

          {/* Activity timeline */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Activity className="w-3 h-3 text-emerald-400/60" />
              <span className="text-[10px] text-white/25 uppercase tracking-widest">Son Etkinlik</span>
            </div>
            {logs === null ? (
              <div className="flex items-center gap-2 text-white/30 text-xs py-4 justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Yükleniyor...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-6 text-white/20 text-xs">Henüz etkinlik yok</div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-[12px] text-white/65 font-medium">
                      {ACTION_LABELS[log.action_type] ?? log.action_type}
                    </span>
                    <span className="text-[10px] text-white/30 tabular-nums">
                      {timeAgo(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({
  icon: Icon, label, value, valueClass = "text-white/75", mono = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-2 text-white/35">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <span className={`text-[12px] font-medium ${valueClass} ${mono ? "tabular-nums" : ""} truncate max-w-[60%] text-right`}>
        {value}
      </span>
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({ user, onOpen }: { user: UserRow; onOpen: (u: UserRow) => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const handle = (e: React.MouseEvent, action: () => Promise<void>) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await action();
        setFeedback("success");
        router.refresh();
        setTimeout(() => setFeedback(null), 2000);
      } catch {
        setFeedback("error");
        setTimeout(() => setFeedback(null), 2000);
      }
    });
  };

  return (
    <div
      onClick={() => onOpen(user)}
      className={`relative rounded-2xl border transition-all duration-200 p-4 cursor-pointer hover:border-white/[0.12] ${
        user.is_premium
          ? "bg-purple-950/20 border-purple-500/20"
          : "bg-white/[0.02] border-white/[0.05]"
      }`}
    >
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 ${
              feedback === "success" ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            {feedback === "success"
              ? <CheckCircle className="w-7 h-7 text-green-400" />
              : <XCircle className="w-7 h-7 text-red-400" />
            }
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            user.is_premium
              ? "bg-purple-500/15 border border-purple-500/25"
              : "bg-white/[0.04] border border-white/[0.08]"
          }`}>
            {user.is_premium
              ? <Crown className="w-3.5 h-3.5 text-purple-400" />
              : <User className="w-3.5 h-3.5 text-white/35" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {user.is_premium ? (
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  {user.subscription_type === "lifetime"
                    ? <><Infinity className="w-2.5 h-2.5" /> Lifetime</>
                    : <><Repeat className="w-2.5 h-2.5" /> Aylık</>
                  }
                </span>
              ) : (
                <span className="text-[10px] text-white/20 uppercase tracking-wider">Free</span>
              )}
              {user.last_sign_in_at && (
                <span className="text-[10px] text-white/25 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {timeAgo(user.last_sign_in_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
          ) : user.is_premium ? (
            <button
              onClick={(e) => handle(e, () => revokePremium(user.id))}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400 text-[11px] font-medium hover:bg-red-500/15 transition-all cursor-pointer"
            >
              <ShieldX className="w-3 h-3" /> İptal
            </button>
          ) : (
            <>
              <button
                onClick={(e) => handle(e, () => grantPremium(user.id, "monthly"))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/8 border border-purple-500/15 text-purple-400 text-[11px] font-medium hover:bg-purple-500/15 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" /> Aylık
              </button>
              <button
                onClick={(e) => handle(e, () => grantPremium(user.id, "lifetime"))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15 text-amber-400 text-[11px] font-medium hover:bg-amber-500/15 transition-all cursor-pointer"
              >
                <Crown className="w-3 h-3" /> Lifetime
              </button>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-white/15 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminClient({
  users, adminEmail, pwaInstallCount, newUsersThisWeek, activeUsers24h,
  estimatedMRR, expiringUsers, dailySignups, sunSignDistribution,
  topFortuneTypes, monthlyPremiumCount, lifetimePremiumCount,
}: AdminClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const premiumCount = users.filter((u) => u.is_premium).length;
  const freeCount = users.length - premiumCount;
  const conversionRate = users.length > 0 ? ((premiumCount / users.length) * 100).toFixed(1) : "0";

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "premium" ? u.is_premium : !u.is_premium);
    return matchSearch && matchFilter;
  });

  const stats = [
    { icon: Users, label: "Toplam", value: users.length, iconClass: "text-blue-400", borderClass: "border-blue-500/10" },
    { icon: Crown, label: "Premium", value: premiumCount, iconClass: "text-purple-400", borderClass: "border-purple-500/15" },
    { icon: User, label: "Free", value: freeCount, iconClass: "text-white/40", borderClass: "border-white/[0.05]" },
    { icon: Smartphone, label: "PWA Yükleme", value: pwaInstallCount, iconClass: "text-emerald-400", borderClass: "border-emerald-500/10" },
    { icon: Activity, label: "Günlük Aktif", value: activeUsers24h, sub: "son 24 saat", iconClass: "text-teal-400", borderClass: "border-teal-500/10" },
    { icon: TrendingUp, label: "Bu Hafta", value: `+${newUsersThisWeek}`, sub: "son 7 gün", iconClass: "text-cyan-400", borderClass: "border-cyan-500/10" },
    { icon: Percent, label: "Dönüşüm", value: `${conversionRate}%`, sub: "premium oranı", iconClass: "text-orange-400", borderClass: "border-orange-500/10" },
    { icon: Wallet, label: "Tahmini MRR", value: formatCurrency(estimatedMRR), sub: "aylık sürekli gelir", iconClass: "text-amber-400", borderClass: "border-amber-500/15" },
  ];

  return (
    <div className="min-h-screen bg-[#050508] pt-28 pb-20 px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-700/4 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-700/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
            </div>
            <p className="text-white/25 text-xs ml-12">{adminEmail}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/35 font-medium">Canlı</span>
          </div>
        </motion.div>

        {/* KPI Grid - 8 stats on 2x4 (desktop) or 2x4 (mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} sub={s.sub} delay={0.05 + i * 0.04} />
          ))}
        </div>

        {/* Analytics Row - 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WeeklyChart dailySignups={dailySignups} />
          <PremiumBreakdown
            monthlyCount={monthlyPremiumCount}
            lifetimeCount={lifetimePremiumCount}
            sunSignDistribution={sunSignDistribution}
          />
          <PopularFortunes items={topFortuneTypes} />
        </div>

        {/* Expiring Soon */}
        <ExpiringBanner expiringUsers={expiringUsers} />

        {/* User Management */}
        <motion.div {...fadeUp(0.45)}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-white/30" />
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Kullanıcılar</h2>
            <span className="ml-auto text-[11px] text-white/20 tabular-nums">{filtered.length} sonuç</span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                placeholder="E-posta ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 transition-colors"
              />
            </div>
            <div className="flex rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02]">
              {(["all", "premium", "free"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 text-[11px] font-semibold transition-all cursor-pointer ${
                    filter === f
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-white/25 hover:text-white/50"
                  }`}
                >
                  {f === "all" ? "Tümü" : f === "premium" ? "Premium" : "Free"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-14 text-white/15 text-sm">Kullanıcı bulunamadı</div>
            ) : (
              filtered.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.2, ease: EASE }}
                >
                  <UserCard user={user} onOpen={setSelectedUser} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
