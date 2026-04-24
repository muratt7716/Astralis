export interface DriftProfile {
  tone_depth: number;
  humor_frequency: number;
  challenge_level: number;
}

export const DEFAULT_DRIFT: DriftProfile = {
  tone_depth: 0.5,
  humor_frequency: 0.5,
  challenge_level: 0.3,
};

const DELTA = 0.05;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function updateDriftProfile(
  current: DriftProfile,
  signals: { avgUserMessageLength: number; messageCount: number }
): DriftProfile {
  const isDeep = signals.avgUserMessageLength > 80;
  const isActive = signals.messageCount >= 4;

  return {
    tone_depth: clamp(current.tone_depth + (isDeep ? DELTA : -DELTA * 0.5)),
    humor_frequency: clamp(current.humor_frequency + (isDeep ? -DELTA * 0.3 : DELTA * 0.3)),
    challenge_level: clamp(current.challenge_level + (isActive ? DELTA * 0.4 : 0)),
  };
}

export function extractSignals(
  chatHistory: Array<{ role: string; content: string }>
): { avgUserMessageLength: number; messageCount: number } {
  const userMessages = chatHistory.filter(m => m.role === "user");
  const total = userMessages.reduce((sum, m) => sum + m.content.length, 0);
  return {
    avgUserMessageLength: userMessages.length > 0 ? total / userMessages.length : 0,
    messageCount: userMessages.length,
  };
}

export function buildDriftDirective(drift: DriftProfile): string {
  const parts: string[] = [];

  if (drift.tone_depth > 0.65) {
    parts.push("Bu kullanıcıyla derin konuşmalar ağır bastı — biraz daha ağırlıklı ol.");
  } else if (drift.tone_depth < 0.35) {
    parts.push("Bu kullanıcıyla çoğunlukla hafif sohbetler geçti — hafif kal.");
  }

  if (drift.humor_frequency > 0.65) {
    parts.push("Mizah dozunu yüksek tut.");
  } else if (drift.humor_frequency < 0.35) {
    parts.push("Mizah dozunu kıs.");
  }

  if (drift.challenge_level > 0.55) {
    parts.push("Bu kullanıcı meydan okumayı seviyor — gerektiğinde cesaretlendirici bir baskı uygula.");
  }

  if (parts.length === 0) return "";
  return `Ton Kalibrasyonu (sadece bu kullanıcıya özel): ${parts.join(" ")}`;
}

export function parseDriftProfile(raw: unknown): DriftProfile {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_DRIFT };
  const r = raw as Record<string, unknown>;
  return {
    tone_depth: typeof r.tone_depth === "number" ? clamp(r.tone_depth) : DEFAULT_DRIFT.tone_depth,
    humor_frequency: typeof r.humor_frequency === "number" ? clamp(r.humor_frequency) : DEFAULT_DRIFT.humor_frequency,
    challenge_level: typeof r.challenge_level === "number" ? clamp(r.challenge_level) : DEFAULT_DRIFT.challenge_level,
  };
}
