import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { callGeminiWithFallback } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { 
      fullName, 
      dob, 
      coreNumbers, 
      neuroMatrix, 
      language = "tr",
      userId
    } = body;

    const prompt = `
Sen klinik psikolojiye, sinirbilime ve ezoterik bilimlere (Pisagor, Keldani numerolojisi, Hans Decoz metotları) hakim bilge bir analistsin.
Asla "Yapay Zeka", "AI", "Bot", "Sistem" gibi kelimeler kullanma. Kendini doğrudan klinik ve ezoterik bir sentez sunan bir rehber olarak konumlandır.

Kullanıcının adı: ${fullName}
Doğum Tarihi: ${dob}

Sayısal Profili:
- Yaşam Yolu (Life Path): ${coreNumbers?.lifePath}
- İfade / Kader (Expression): ${coreNumbers?.expression}
- Ruh Güdüsü (Soul Urge): ${coreNumbers?.soulUrge}
- Kişilik (Personality): ${coreNumbers?.personality}
- Olgunluk (Maturity): ${coreNumbers?.maturity}

Eksik Frekanslar (Pasif Nöromatris): ${neuroMatrix?.missing?.join(", ")}
Fazla Frekanslar (Aktif Nöromatris): ${neuroMatrix?.excess?.join(", ")}

Lütfen bu verileri kullanarak "Klinik ve Ezoterik Sentez" formatında bütüncül bir analiz hazırla.
Sıradan astroloji veya yüzeysel fal yorumları yapma. Bilimsel, psikolojik kavramları ezoterik bilgiyle harmanla.

Analizini şu 4 ana başlık altında pürüzsüz bir JSON formatında dön:
1. "pythagorean" (Pisagor & Keldani & Decoz): Pisagor, Keldani ve Decoz sistemlerine göre çekirdek sayıların genel dinamiği ve karmik kökeni. (En az 3-4 okkalı, felsefi cümle)
2. "jungian" (Jung Psikolojisi): Sayısal profilin Jung Psikolojisi çerçevesinde işaret ettiği arketipler, bilinçaltı motivasyonları ve gölge (shadow) tarafları. (En az 3-4 okkalı, psikolojik analiz içeren cümle)
3. "neuroscience" (Sinirbilim): Nöromatris eksik/fazlaları ve yaşam yolu üzerinden beynin frekans aktarımları, nöroplastisite, amigdala/prefrontal korteks dengesi, lob dinamikleri ve varsayımsal sinirbilimsel yansımaları. (Örneğin "Eksik 8 frekansının sol prefrontal korteks yönetici zafiyetine etkisi" gibi bilimsel temelli metaforik açıklamalar yap). (En az 3-4 okkalı cümle)
4. "synthesis" (Bütüncül Sentez): Tüm bu ezoterik ve klinik verilerin günlük hayatta kullanılabilir stratejik, vizyoner özeti.
5. "prescription" (Nöro-Mistik Şifa Reçetesi): Nöromatris eksik frekanslarını (eğer eksik yoksa en zayıf alanı) şifalandırmak için; sabah veya gece rutinine eklenebilecek basit ve pratik 1 fiziksel eylem, 1 frekans/olumlama mantrası ve 1 solfeggio ses frekansı (örn: eksik 4 için 396 Hz) tavsiyesi. UYARI: Bu alan BAŞLIKLARA BÖLÜNMEDEN, DÜZ METİN (STRING YAZI) OLARAK dönülmelidir (Yani fiziksel_eylem, mantra vb. gibi keyleri olan yeni bir json objesi AÇMA, hepsini tek paragrafta yaz).

DİL: ${language.toUpperCase()}. Yanıtı KESİNLİKLE belirtilen dilde (${language}) ver.
KESİNLİKLE markdown \`\`\`json karakterleri KOYMA! Sadece aşağıdaki formatta geçerli, pür JSON objesi dön:
{
  "pythagorean": "...",
  "jungian": "...",
  "neuroscience": "...",
  "synthesis": "...",
  "prescription": "..."
}
`;

    const aiText = await callGeminiWithFallback(prompt);

    let analysis: any = {};
    try {
      const start = aiText.indexOf("{");
      const end = aiText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        analysis = JSON.parse(aiText.substring(start, end + 1));
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback
      analysis = {
        pythagorean: "Sayısal frekanslarınız yoğun bir titreşim alanından geçiyor. Çekirdek sayılarınız kadim yöntemlere göre bir dönüşüm evresinde.",
        jungian: "Bilinçaltı motifleriniz, kolektif bilinçdışından gelen güçlü arketiplerle rezonansa giriyor. Gölgelerinizle yüzleşme vakti.",
        neuroscience: "Nöral ağlarınızdaki varsayımsal sinaptik aktarımlar, eksik frekanslarınızı tamamlamak için yeni yollar arıyor. Bilişsel esnekliğiniz kritik bir seviyede.",
        synthesis: "Frekanslarınızı bedensel ve zihinsel bir dengeye oturtmak için kendi iç zekanıza kulak verin.",
        prescription: "Eksik frekanslarınızı şifalandırmak için doğada çıplak ayakla yürüyün (Grounding). Günlük olarak 528 Hz (Dönüşüm Mucizesi) frekansı dinleyin ve 'Evrenin şifa enerjisi bedenimde dengeleniyor' mantrasını tekrarlayın."
      };
    }

    if (userId) {
      // Optional logging
      (async () => {
        try {
          await supabaseAdmin.from("interaction_logs").insert({
            user_id: userId,
            action_type: "numerology_synthesis_analyze",
            description: "Numeroloji klinik ve ezoterik sentezi yapıldı.",
            metadata: { 
              fullName, 
              dob, 
              coreNumbers, 
              neuroMatrix,
              full_result: analysis 
            }
          });
        } catch (e) {
          console.error("Supabase log error:", e);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (err) {
    console.error("[numerology/analyze] route error:", err);
    return NextResponse.json({ success: false, error: "Klinik ve Ezoterik Sentez oluşturulamadı." }, { status: 500 });
  }
}
