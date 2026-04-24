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

const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  vertexai: true,
  googleAuthOptions: { credentials },
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

const VOICES = ["Kore", "Aoede", "Puck", "Charon", "Fenrir", "Zephyr"];

const GUIDE_PROMPTS: Record<string, string> = {
  melisa: "Sen Melisa'sın — sıcak, derin, mistik bir Türk falcı rehberi. Kısa ve samimi cevap ver.",
  aras: "Sen Aras'sın — sakin, bilge, Anadolu'nun doğasından güç alan bir rehber. Kısa cevap ver.",
  umut: "Sen Umut'sun — enerjik, pozitif, genç bir rehber. Kısa ve canlı cevap ver.",
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

  const systemInstruction = GUIDE_PROMPTS[guideId] || GUIDE_PROMPTS.melisa;

  try {
    const audioChunks: Buffer[] = [];
    let turnDone = false;
    let rejectFn: (e: unknown) => void = () => {};

    const responsePromise = new Promise<Buffer>((resolve, reject) => {
      rejectFn = reject;

      const onmessage = (msg: LiveServerMessage) => {
        if (turnDone) return;

        const parts = msg.serverContent?.modelTurn?.parts;
        if (parts) {
          for (const part of parts) {
            const data = (part as any).inlineData?.data;
            if (data) {
              audioChunks.push(Buffer.from(data, "base64"));
            }
          }
        }

        if (msg.serverContent?.turnComplete) {
          turnDone = true;
          if (audioChunks.length === 0) {
            reject(new Error("Gemini Live responded but sent no audio data"));
            return;
          }
          resolve(Buffer.concat(audioChunks));
        }
      };

      // 15s timeout
      setTimeout(() => {
        if (!turnDone) reject(new Error("Gemini Live timed out after 15s"));
      }, 15000);

      ai.live
        .connect({
          model: "gemini-2.0-flash-live-001",
          config: {
            responseModalities: ["AUDIO"] as any,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            } as any,
          },
          callbacks: {
            onopen: undefined,
            onmessage,
            onerror: (e: any) => reject(new Error(`WebSocket error: ${e?.message || String(e)}`)),
            onclose: (e: any) => {
              if (!turnDone) reject(new Error(`WebSocket closed unexpectedly (code: ${e?.code})`));
            },
          },
        })
        .then((session) => {
          session.sendClientContent({
            turns: [{ role: "user", parts: [{ text }] }],
            turnComplete: true,
          });

          // Close session after response is collected
          responsePromise.then(() => session.close()).catch(() => session.close());
        })
        .catch(reject);
    });

    const pcmData = await responsePromise;
    const wavData = buildWavBuffer(pcmData);

    console.log(`[VoiceTest] OK — guide:${guideId} voice:${voiceName} pcm:${pcmData.length}B`);

    return new Response(wavData.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(wavData.length),
        "X-Voice": voiceName,
        "X-PCM-Bytes": String(pcmData.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[VoiceTest] Error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
