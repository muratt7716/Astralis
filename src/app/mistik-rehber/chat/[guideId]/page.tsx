"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import { GUIDES } from "@/components/Profile/ProfileConstants";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import PremiumGate from "@/components/PremiumGate";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const WARMTH_LABELS: Record<string, string> = {
  stranger: "Yeni Tanışıklık",
  acquaintance: "Tanışık",
  friend: "Dost",
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.guideId as string;
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];

  const { user, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [warmthLevel, setWarmthLevel] = useState("stranger");
  const [distinctDays, setDistinctDays] = useState(0);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth + history yükleme
  const userId = user?.id;
  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      router.push("/onboarding");
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingHistory(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || "";

        const res = await fetch(`/api/mistik-rehber/history?guideId=${guideId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (cancelled) return;

        if (!res.ok) {
          console.error("[ChatPage] History API error:", res.status);
          setLoadingHistory(false);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.conversationId) setConversationId(data.conversationId);
        if (data.warmthLevel) setWarmthLevel(data.warmthLevel);
        if (data.distinctDays !== undefined) setDistinctDays(data.distinctDays);
        if (data.messages?.length > 0) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("[ChatPage] History load error:", err);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, userId, guideId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending || !user) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/mistik-rehber/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ guideId, message: userMessage, conversationId }),
      });

      if (res.status === 402) {
        setPremiumBlocked(true);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setSending(false);
        return;
      }

      if (!res.ok) throw new Error("API hatası");

      const data = await res.json();

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { id: `user-${Date.now()}`, role: "user", content: userMessage, createdAt: new Date().toISOString() },
        { id: `assistant-${Date.now()}`, role: "assistant", content: data.message, createdAt: new Date().toISOString() },
      ]);

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.warmthLevel) setWarmthLevel(data.warmthLevel);
      if (data.distinctDays !== undefined) setDistinctDays(data.distinctDays);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, user, guideId, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only block on auth loading — history loads in background
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${guide.glow}, transparent)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ boxShadow: `0 0 60px ${guide.glow}` }}
        >
          <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
        </motion.div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PremiumGate featureName="Mistik Rehber">
    <div className="fixed inset-0 bg-[#050505] flex flex-col text-white overflow-hidden">

      {/* ── Atmosfer katmanı ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ana glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(ellipse 80% 60% at 15% 10%, ${guide.glow}, transparent 70%)` }}
        />
        {/* Alt glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(ellipse 60% 50% at 85% 90%, ${guide.glow}, transparent 70%)` }}
        />
        {/* İnce grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="relative z-30 shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]"
        style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.95), rgba(5,5,5,0.8))", backdropFilter: "blur(20px)" }}
      >
        {/* Geri butonu */}
        <button
          onClick={() => router.push("/profil")}
          className="group flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.06] transition-all duration-200 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
        </button>

        {/* Avatar */}
        <div
          className="relative shrink-0 w-10 h-10 rounded-2xl overflow-hidden border border-white/10"
          style={{ boxShadow: `0 0 20px ${guide.glow}40` }}
        >
          <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
          {/* Canlı göstergesi */}
          <div
            className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-[#050505]"
            style={{ backgroundColor: guide.glow.replace("0.3", "1").replace("0.4", "1") }}
          />
        </div>

        {/* İsim & durum */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-[14px] font-semibold truncate", guide.accent)} style={{ fontFamily: "'Playfair Display', serif" }}>
              {guide.role}
            </span>
            <span className={cn(
              "shrink-0 text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border",
              guide.bgAccent, guide.borderAccent, guide.accent
            )}>
              {WARMTH_LABELS[warmthLevel]}
            </span>
          </div>
          <p className="text-[10px] text-white/25 mt-0.5">
            {distinctDays > 0 ? `${distinctDays} gündür konuşuyorsunuz` : "İlk konuşmanız"}
          </p>
        </div>

        {/* Sağ boşluk dengesi */}
        <div className="w-9 shrink-0" />
      </header>

      {/* ── Mesaj Alanı ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* Boş durum — karşılama ekranı */}
          {!loadingHistory && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-16 gap-6 text-center"
            >
              {/* Büyük avatar */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-40 scale-110"
                  style={{ background: guide.glow }}
                />
                <div
                  className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border border-white/15"
                  style={{ boxShadow: `0 20px 60px ${guide.glow}60` }}
                >
                  <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* İsim */}
              <div>
                <h2 className={cn("text-2xl font-bold mb-1", guide.accent)} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {guide.role}
                </h2>
                <p className="text-white/30 text-[12px] font-light tracking-widest uppercase">
                  {guide.traits.join("  ·  ")}
                </p>
              </div>

              {/* Alıntı */}
              <div className={cn("relative max-w-xs px-6 py-4 rounded-2xl border", guide.bgAccent, guide.borderAccent)}>
                <p className="text-white/60 text-[13px] italic leading-relaxed">
                  &ldquo;{guide.bio}&rdquo;
                </p>
              </div>

              <p className="text-white/20 text-[11px] tracking-wider">
                Aklındaki her şeyi benimle paylaşabilirsin
              </p>
            </motion.div>
          )}

          {/* Mesajlar */}
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn("flex items-end gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {/* Rehber avatarı */}
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-xl overflow-hidden border border-white/10 mb-0.5">
                    <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Mesaj balonu */}
                <div
                  className={cn(
                    "relative max-w-[78%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-white/[0.09] text-white/90 border border-white/[0.08] rounded-br-md"
                      : cn("border rounded-bl-md text-white/85", guide.bgAccent, guide.borderAccent)
                  )}
                  style={msg.role === "assistant" ? { boxShadow: `0 4px 24px ${guide.glow}20` } : {}}
                >
                  {/* Rehber mesajı için ince glow kenar */}
                  {msg.role === "assistant" && (
                    <div
                      className="absolute inset-0 rounded-2xl rounded-bl-md opacity-30 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 0 1px ${guide.glow}` }}
                    />
                  )}
                  <p className="relative whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Yazıyor animasyonu */}
          <AnimatePresence>
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="flex items-end gap-2.5 justify-start"
              >
                <div className="shrink-0 w-7 h-7 rounded-xl overflow-hidden border border-white/10">
                  <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                </div>
                <div
                  className={cn("px-4 py-3 rounded-2xl rounded-bl-md border", guide.bgAccent, guide.borderAccent)}
                  style={{ boxShadow: `0 4px 24px ${guide.glow}20` }}
                >
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: guide.glow.replace("0.3", "0.8").replace("0.4", "0.8") }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-2" />
        </div>
      </main>

      {/* ── Premium Duvarı ────────────────────────────────────────── */}
      <AnimatePresence>
        {premiumBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backdropFilter: "blur(16px)", background: "rgba(5,5,5,0.75)" }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm rounded-[2rem] border border-white/[0.08] p-8 text-center space-y-5"
              style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(15,15,15,0.95))" }}
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border", guide.bgAccent, guide.borderAccent)}>
                <Lock className={cn("w-6 h-6", guide.accent)} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Premium Özellik
                </h2>
                <p className="text-white/40 text-[13px] leading-relaxed">
                  5 mesajlık ücretsiz deneme hakkın doldu. {guide.role} ile sınırsız konuşmak için premium üyeliğe geç.
                </p>
              </div>
              <button
                onClick={() => router.push("/profil")}
                className="w-full h-12 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                Premium&apos;a Geç
              </button>
              <button
                onClick={() => setPremiumBlocked(false)}
                className="w-full text-white/25 text-[11px] hover:text-white/50 transition-colors"
              >
                Geri Dön
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Alanı ───────────────────────────────────────────── */}
      <div
        className="relative z-30 shrink-0 px-4 pb-6 pt-3"
        style={{ background: "linear-gradient(to top, rgba(5,5,5,1) 60%, rgba(5,5,5,0))" }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className={cn(
              "flex items-end gap-2 px-3 py-2 rounded-2xl border transition-all duration-200",
              guide.borderAccent,
            )}
            style={{
              background: "rgba(255,255,255,0.03)",
              boxShadow: input ? `0 0 0 1px ${guide.glow}60, 0 8px 32px ${guide.glow}20` : "none",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${guide.name}'e yaz…`}
              rows={1}
              className="flex-1 bg-transparent resize-none px-1 py-1.5 text-[14px] text-white/90 placeholder:text-white/20 focus:outline-none leading-relaxed"
              style={{ maxHeight: "120px", overflowY: "auto" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className={cn(
                "shrink-0 mb-0.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90",
                input.trim() && !sending
                  ? "bg-white text-black shadow-lg hover:bg-white/90"
                  : "bg-white/[0.05] text-white/20 cursor-default"
              )}
              style={input.trim() && !sending ? { boxShadow: `0 4px 20px ${guide.glow}40` } : {}}
            >
              {sending ? (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <p className="text-center text-white/[0.12] text-[10px] mt-2 tracking-wider select-none">
            Enter · gönder &nbsp;·&nbsp; Shift+Enter · satır atla
          </p>
        </div>
      </div>
    </div>
    </PremiumGate>
  );
}
