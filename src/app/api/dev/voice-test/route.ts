// DEV ONLY — remove before production
import { NextRequest } from "next/server";
import { GoogleGenAI, type LiveServerMessage } from "@google/genai";

export const runtime = "nodejs";

let credentials: any = {};
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
} catch {}

// Live API requires v1beta1 on Vertex AI
const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "us-central1",
  vertexai: true,
  googleAuthOptions: { credentials },
  httpOptions: { apiVersion: "v1beta1" },
});

function buildWavBuffer(pcmData: Buffer): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataLength = pcmData.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * numChannels * bitsPerSample) / 8, 28);
  header.writeUInt16LE((numChannels * bitsPerSample) / 8, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmData]);
}

// Vertex AI Live API model names — in order of preference
const LIVE_MODELS = [
  "gemini-live-2.5-flash-native-audio",
  "gemini-live-2.5-flash-preview-native-audio-09-2025",
  "gemini-2.0-flash-live-001",
];

// Must match VOICE_GROUPS in page.tsx exactly
const VOICES = [
  // Erkek
  "Charon", "Gacrux", "Orus", "Fenrir", "Puck",
  // Kadın — sıcak
  "Aoede", "Kore", "Laomedeia", "Erinome", "Autonoe",
  // Kadın — mistik
  "Schedar", "Iapetus", "Umbriel", "Leda", "Despina",
];

const GUIDE_PROMPTS: Record<string, string> = {
  melisa: "Sen Melisa'sın — sıcak, anaç, mistik bir Türk falcı rehberi. Doğal bir tempo ve sıcak bir sesle, kısa ve samimi cevap ver.",
  aras: "Sen Aras'sın — dramatik, estetik, hafif efemine bir sanat yönetmenisin. Teatral ama doğal bir hızda konuş. Kısa cevap ver.",

  // Umut V1 — fiziksel ses tanımı: boğuk, taştan yonturcasına
  "umut-v1": "Sen Umut'sun. 60 yaşında, Kaçkar dağlarında onlarca kış geçirmiş eski bir komando şaman. Sesin boğuk ve derin — yıllarca rüzgara karşı bağırdığın için. Her kelimeyi sanki taştan yontuyor gibi çıkarırsın. Az konuşursun, söylediğin her şey ağırdır. Kısa cevap ver.",

  // Umut V2 — duygusal ağırlık: yorgun ama kırılmamış, nefesli
  "umut-v2": "Sen Umut'sun. Yıllar seni yavaşlatmış ama kırmamış. 60'lı yaşların ağırlığı ve bilgeliği var üstünde. Gereksiz kelime kullanmazsın, her cümle bir yargı gibidir. Nefes alarak konuşursun — derin ama sakin. Kısa tut.",

  // Umut V3 — metafor: dağ geçidi, bıçak gibi sözler, kurt totemi
  "umut-v3": "Sen Umut'sun. Erzurum'un taş soğuğunda yetişmiş Kurt toteminin şamanısın. Sesin dağ geçitlerinden gelir gibi alçak ve boğuk. Her söz az ama keskin — bıçak gibi. Cümleler arası doğal bir nefes var ama takılmazsın. Kısa cevap ver.",

  // Umut V4 — doğrudan yaş + karakter kısalığı, yorum yok
  "umut-v4": "Sen Umut'sun. 62 yaşında, eski komando, Erzurum'lu şaman. Sesin kısık ve derin. Lafı kısa tutarsın çünkü fazlası gereksiz. Kısa cevap ver.",

  hekate: "Sen Hekate'sin — gizemli, otoriter, şiirsel konuşan bir mistik rehbersin. Yavaş ve ağır bir tempo kullan ama takılmadan akar gibi devam et. Her cümle ağırlık taşısın. Kısa cevap ver.",
  selin: "Sen Selin'sin — enerjik, manifesting koçu, kuantum jargonu kullanan bir vizyonersin. Hızlı ve canlı konuş, motivasyon dolu ama samimi. Kısa cevap ver.",
};

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Dev endpoint disabled in production" }), { status: 403 });
  }

  const { text, voiceName = "Kore", guideId = "melisa" } = await req.json();

  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: "text required" }), { status: 400 });
  }

  if (!VOICES.includes(voiceName)) {
    return new Response(JSON.stringify({ error: `voiceName must be one of: ${VOICES.join(", ")}` }), { status: 400 });
  }

  const systemInstruction = GUIDE_PROMPTS[guideId] ?? GUIDE_PROMPTS["melisa"];

  let lastModelError = "";

  for (const modelName of LIVE_MODELS) {
    console.log(`[VoiceTest] Trying model: ${modelName}`);
    try {
      const audioChunks: Buffer[] = [];
      let turnDone = false;

      const pcmData = await new Promise<Buffer>((resolve, reject) => {
        const onmessage = (msg: LiveServerMessage) => {
          if (turnDone) return;

          const parts = msg.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              const data = (part as any).inlineData?.data;
              if (data) audioChunks.push(Buffer.from(data, "base64"));
            }
          }

          if (msg.serverContent?.turnComplete) {
            turnDone = true;
            if (audioChunks.length === 0) {
              reject(new Error(`${modelName}: turnComplete received but no audio data`));
              return;
            }
            resolve(Buffer.concat(audioChunks));
          }
        };

        // 15s timeout
        const timer = setTimeout(() => {
          if (!turnDone) reject(new Error(`${modelName}: timed out after 15s`));
        }, 15000);

        ai.live
          .connect({
            model: modelName,
            config: {
              responseModalities: ["AUDIO"] as any,
              systemInstruction: { parts: [{ text: systemInstruction }] },
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } },
              } as any,
            },
            callbacks: {
              onmessage,
              onerror: (e: any) => {
                clearTimeout(timer);
                const msg2 = e?.message || e?.type || JSON.stringify(e) || "unknown error";
                reject(new Error(`${modelName}: WebSocket error — ${msg2}`));
              },
              onclose: (e: any) => {
                clearTimeout(timer);
                if (!turnDone) reject(new Error(`${modelName}: closed (code:${e?.code} reason:${e?.reason || "none"})`));
              },
            },
          })
          .then((session) => {
            session.sendClientContent({
              turns: [{ role: "user", parts: [{ text }] }],
              turnComplete: true,
            });
          })
          .catch((connectErr: unknown) => {
            clearTimeout(timer);
            reject(connectErr);
          });
      });

      // Success
      const wavData = buildWavBuffer(pcmData);
      console.log(`[VoiceTest] OK — model:${modelName} voice:${voiceName} pcm:${pcmData.length}B`);

      return new Response(wavData.buffer as ArrayBuffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(wavData.length),
          "X-Model": modelName,
          "X-Voice": voiceName,
          "X-PCM-Bytes": String(pcmData.length),
        },
      });
    } catch (err: unknown) {
      lastModelError = err instanceof Error ? err.message : String(err);
      console.warn(`[VoiceTest] Model ${modelName} failed:`, lastModelError);
    }
  }

  return new Response(
    JSON.stringify({ error: `All models failed. Last error: ${lastModelError}` }),
    { status: 500 }
  );
}
