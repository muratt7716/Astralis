"use client";

// DEV ONLY — /dev/voice-test
// Gemini Live API ses kalitesi test sayfası

import { useState, useRef } from "react";

// Gemini Live 2.5 — onaylı erkek sesler sadece 4 tane
// Derin/yaşlı için en iyi adaylar Charon ve Gacrux
const VOICE_GROUPS = [
  {
    label: "Erkek — Derin / Olgun (Umut & Aras için)",
    voices: [
      { name: "Charon", desc: "calm, professional — en derin" },
      { name: "Gacrux", desc: "mature, experienced — en olgun" },
      { name: "Orus", desc: "grounded — sakin derin" },
      { name: "Fenrir", desc: "excitable — enerjik (Umut için zayıf)" },
      { name: "Puck", desc: "upbeat — genç/enerjik (Aras için zayıf)" },
    ],
  },
  {
    label: "Kadın — Sıcak (Melisa / Selin için)",
    voices: [
      { name: "Aoede", desc: "warm — sıcak, samimi" },
      { name: "Kore", desc: "firm — güçlü, kararlı" },
      { name: "Laomedeia", desc: "upbeat feminine" },
      { name: "Erinome", desc: "clear feminine" },
      { name: "Autonoe", desc: "bright feminine" },
    ],
  },
  {
    label: "Kadın — Mistik / Derin (Hekate için)",
    voices: [
      { name: "Schedar", desc: "even — sakin, düz" },
      { name: "Iapetus", desc: "clear — net, soğuk" },
      { name: "Umbriel", desc: "neutral — nötr, gölgeli" },
      { name: "Leda", desc: "youthful feminine" },
      { name: "Despina", desc: "smooth feminine" },
    ],
  },
];
const VOICES = VOICE_GROUPS.flatMap(g => g.voices.map(v => v.name));
const GUIDES = [
  { id: "melisa", label: "Melisa" },
  { id: "aras", label: "Aras" },
  { id: "umut", label: "Umut" },
];

const PRESETS = [
  "Merhaba, bugün nasıl hissediyorsun?",
  "Sana bir sorum var, aşk hayatım hakkında ne düşünüyorsun?",
  "Yıldızlar bu gece bana ne söylüyor?",
  "Kaderim hakkında bir şeyler hissediyor musun?",
];

export default function VoiceTestPage() {
  const [text, setText] = useState(PRESETS[0]);
  const [voice, setVoice] = useState("Kore");
  const [guide, setGuide] = useState("melisa");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ pcmBytes: number; durationMs: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  async function handleTest() {
    setStatus("loading");
    setError("");
    setStats(null);

    const t0 = Date.now();

    try {
      const res = await fetch("/api/dev/voice-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName: voice, guideId: guide }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || res.statusText);
      }

      const pcmBytes = Number(res.headers.get("X-PCM-Bytes") || 0);
      const blob = await res.blob();

      // Revoke previous URL
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }

      setStats({ pcmBytes, durationMs: Date.now() - t0 });
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#e2d9f3", fontFamily: "monospace", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Gemini Live — Ses Kalite Testi</h1>
      <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "2rem" }}>DEV ONLY — production&apos;da bu sayfa açılmaz</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 600 }}>

        {/* Voice selector — grouped */}
        <div>
          <label style={{ display: "block", marginBottom: "0.6rem", color: "#a78bfa" }}>Ses (Voice)</label>
          {VOICE_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: "0.8rem" }}>
              <div style={{ fontSize: "0.72rem", color: "#666", marginBottom: "0.3rem" }}>{group.label}</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {group.voices.map(v => (
                  <button
                    key={v.name}
                    onClick={() => setVoice(v.name)}
                    title={v.desc}
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: voice === v.name ? "#a78bfa" : "#333",
                      background: voice === v.name ? "#2d1f6e" : "#1a1a2e",
                      color: voice === v.name ? "#e2d9f3" : "#888",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                    }}
                  >
                    {v.name} <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>({v.desc.split(" / ")[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Guide selector */}
        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", color: "#a78bfa" }}>Rehber</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {GUIDES.map(g => (
              <button
                key={g.id}
                onClick={() => setGuide(g.id)}
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: 6,
                  border: "1px solid",
                  borderColor: guide === g.id ? "#a78bfa" : "#333",
                  background: guide === g.id ? "#2d1f6e" : "#1a1a2e",
                  color: guide === g.id ? "#e2d9f3" : "#888",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset messages */}
        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", color: "#a78bfa" }}>Hazır Mesajlar</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setText(p)}
                style={{
                  padding: "0.3rem 0.6rem",
                  borderRadius: 6,
                  border: "1px solid",
                  borderColor: text === p ? "#a78bfa" : "#2a2a3e",
                  background: text === p ? "#1f1040" : "transparent",
                  color: "#ccc",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.8rem",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", color: "#a78bfa" }}>Mesaj</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1a1a2e",
              color: "#e2d9f3",
              fontSize: "0.9rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Test button */}
        <button
          onClick={handleTest}
          disabled={status === "loading" || !text.trim()}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: 8,
            border: "none",
            background: status === "loading" ? "#4a3080" : "#6d28d9",
            color: "#fff",
            fontSize: "1rem",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            fontWeight: "bold",
            alignSelf: "flex-start",
          }}
        >
          {status === "loading" ? "Üretiliyor..." : "Sesi Test Et"}
        </button>

        {/* Audio player */}
        <audio ref={audioRef} controls style={{ width: "100%", display: status === "done" ? "block" : "none" }} />

        {/* Stats */}
        {stats && (
          <div style={{ fontSize: "0.78rem", color: "#888" }}>
            PCM: {(stats.pcmBytes / 1024).toFixed(1)} KB &nbsp;·&nbsp;
            Süre ~{(stats.pcmBytes / (24000 * 2)).toFixed(1)}s ses &nbsp;·&nbsp;
            Yanıt süresi: {stats.durationMs}ms
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "0.8rem", borderRadius: 8, background: "#3b0000", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: "0.85rem" }}>
            <strong>Hata:</strong> {error}
          </div>
        )}

      </div>
    </div>
  );
}
