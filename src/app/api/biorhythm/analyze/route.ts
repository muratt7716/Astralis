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
      targetDate,
      physical, emotional, intellectual, intuitional, aesthetic, spiritual,
      partnerPhysical, partnerEmotional, partnerIntellectual,
      partnerIntuitional, partnerAesthetic, partnerSpiritual,
      relationType,
      partnerBirthDate,
      criticalDays = [],
      language = "tr",
      userId
    } = body;

    // Validation
    if (physical === undefined || emotional === undefined || intellectual === undefined) {
      return NextResponse.json({ success: false, error: "Biyoritim verileri eksik." }, { status: 400 });
    }

    const isSynergy = !!partnerPhysical;

    const criticalDaysStr = criticalDays.length > 0 
      ? `Ayrıca önümüzdeki 7 gün içerisinde birinci kullanıcının şu kritik döngü geçişleri (0 noktaları) var:\n${criticalDays.join("\\n")}`
      : "";

    let prompt = ``;
    if (!isSynergy) {
      prompt = `
Sen kadim ve bilge bir mistik üstatsın. Sadece somut gerçekleri değil, bu gerçeklerin ruhsal ve kozmik yansımalarını da okuyabilirsin.
Kullanıcının ${targetDate || 'bugünkü'} biyoritim döngü (sinüs dalgası) değerleri aşağıdadır:

- Fiziksel: %${physical.value}
- Duygusal: %${emotional.value}
- Zihinsel: %${intellectual.value}
- Sezgisel: %${intuitional?.value ?? 0}
- Estetik: %${aesthetic?.value ?? 0}
- Ruhsal: %${spiritual?.value ?? 0}

${criticalDaysStr}

Statik, sıradan ve sıkıcı tavsiyeler vermek yerine; bu değerlerin birbirleriyle olan KOMBİNASYONUNU yorumla.
(Örneğin; zihinsel çok yüksek ama duygusal çok düşükse bu kişinin o gün makine gibi hissedeceğini ama kalpsiz kararlar alabileceğini vurgula.)
ÇOK ÖNEMLİ: Eğer herhangi bir değer %0'a çok yakınsa (-5 ile +5 arası) veya önümüzdeki günlerde "Kritik Geçiş (0 Noktası)" varsa, BUNUN ÜZERİNDE KESİNLİKLE DUR! Sıfır noktaları enerjinin yön değiştirdiği ve dengesizliklerin yaşandığı anlardır.

Analizini 4 bölümde yapacaksın, dergi makalesi tadında, doyurucu ve uzun uzun yazmanı istiyorum (her bölüm en az 2-3 dolu cümle olsun):
1. overview (Kozmik Sinerji Özeti): O günkü dalgaların kişide nasıl bir genel aura yarattığı.
2. clashes (Kritik Çarpışmalar / Çelişkiler): Zıt değerlerin (örneğin fizikselle duygusalın zıt olması) yaratacağı kişisel savaşlar.
3. psychodynamics (Psikolojik Dinamikler): Zirvedeki veya birbiriyle uyumlu olan çizgilerin kişiye kattığı ruhsal güç.
4. strategy (Üstadın Stratejisi): O günü en iyi şekilde geçirmek için "bio-hacking" tadında taktiksel yaşam rehberi.

Sadece aşağıdaki formatta geçerli, pürüzsüz bir JSON objesi dön:
{
  "overview": "...",
  "clashes": "...",
  "psychodynamics": "...",
  "strategy": "..."
}
DİL: ${language.toUpperCase()}. Yanıtı KESİNLİKLE belirtilen dilde (${language}) ver. Üslup: Kesin, hafif edebi ve tecrübeli bir Üstad. KESİNLİKLE markdown \`\`\`json karakterleri KOYMA! Sadece JSON string.
`;
    } else {
      prompt = `
Sen kadim ve bilge bir mistik üstatsın. Kullanıcı, Sinerji (İlişki) Modunu kullandı ve karşısındaki kişiyle olan bağının türünü "${relationType || "İsimsiz Bağ"}" olarak seçti.
Bugün (${targetDate || 'Bugün'}) için iki kişinin biyoritim değerleri aşağıda kıyaslanmaktadır:

KULLANICI:
- Fiziksel: %${physical.value} | Duygusal: %${emotional.value} | Zihinsel: %${intellectual.value}
- Sezgisel: %${intuitional?.value ?? 0} | Estetik: %${aesthetic?.value ?? 0} | Ruhsal: %${spiritual?.value ?? 0}

PARTNER (${relationType} - Doğum: ${partnerBirthDate || 'Bilinmiyor'}):
- Fiziksel: %${partnerPhysical?.value ?? 0} | Duygusal: %${partnerEmotional?.value ?? 0} | Zihinsel: %${partnerIntellectual?.value ?? 0}
- Sezgisel: %${partnerIntuitional?.value ?? 0} | Estetik: %${partnerAesthetic?.value ?? 0} | Ruhsal: %${partnerSpiritual?.value ?? 0}

Senin görevin tek bir kişinin değil, *İki Kişinin O Günkü Sinerjisini* analiz etmek. 
${relationType} faktörünü dikkate al. Örneğin, eğert bağ "Patron" ise ve kullanıcının fiziksel enerjisi zirvede ama patronun zihinsel enerjisi dipteyse; "Bugün zam isteme" gibi uyarılarda bulunmalısın. Eğer "Aşk" ise ve duygusallıkları kesişmişse telepatik bağlantıdan bahset. Nerede uzlaşıp (benzer veya yüksek), nerede zıt düşeceklerini (biri dipte diğeri zirvede) mükemmel bir şekilde harmanla.

Analizini 4 bölümde yapacaksın, uzun ve derinlikli (her bölüm 2-3 cümle) "İşte buna para verilir" diyecek bir kalitede olsun:
1. overview (Kozmik Sinerji Özeti): İkilinin bugünkü dalgalarının birbiriyle oluşturduğu auranın derin yorumu.
2. clashes (Kritik Çarpışmalar): Uyumsuz (farklı fazda) olan çizgilerin o gün yaratacağı ego, kıskançlık, iletişim veya güç savaşları.
3. psychodynamics (Psikolojik Dinamikler): Uyumlu (ikisi de aynı fazda) çizgilerin bu ikiliye kattığı ortak telepatik veya fiziksel rezonans/güç.
4. strategy (Üstadın Stratejisi): Kullanıcının bu kişiyle olan o günkü ilişkisini iyi yönetmesi için ihtiyacı olan "bio-hacking" stratejisi.

Sadece aşağıdaki formatta geçerli, pürüzsüz bir JSON objesi dön:
{
  "overview": "...",
  "clashes": "...",
  "psychodynamics": "...",
  "strategy": "..."
}
DİL: ${language.toUpperCase()}. Yanıtı KESİNLİKLE belirtilen dilde (${language}) ver. Üslup: Kesin, hafif edebi ve tecrübeli bir Üstad. KESİNLİKLE markdown \`\`\`json karakterleri KOYMA! Sadece pür JSON string.
`;
    }

    const aiText = await callGeminiWithFallback(prompt);

    // Parse JSON response
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
        overview: aiText,
        clashes: "Sinyaller karmaşık. Görünmez çatışmalara dikkat et.",
        psychodynamics: "Kozmik akış bugün belirsiz bir rezonans gösteriyor.",
        strategy: "Adımlarını yavaşlat, içgüdülerine güven ve akışa bırak."
      };
    }

    if (userId) {
      // Optional logging
      (async () => {
        try {
          await supabaseAdmin.from("interaction_logs").insert({
            user_id: userId,
            action_type: isSynergy ? "biorhythm_synergy_analyze" : "biorhythm_analyze",
            description: isSynergy ? "Sinerji biyoritimi analiz edildi." : "Biyoritim kombinasyon analizi yapıldı.",
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
    console.error("[biorhythm/analyze] route error:", err);
    return NextResponse.json({ success: false, error: "Kozmik analiz yapılamadı." }, { status: 500 });
  }
}
