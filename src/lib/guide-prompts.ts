// src/lib/guide-prompts.ts

export type WarmthLevel = "stranger" | "acquaintance" | "friend";

export function getWarmthLevel(distinctDays: number): WarmthLevel {
  if (distinctDays <= 2) return "stranger";
  if (distinctDays <= 6) return "acquaintance";
  return "friend";
}

const warmthPrompts: Record<WarmthLevel, string> = {
  stranger: "Henüz tanışıyorsunuz. Nazik ve biraz mesafeli ol, kendini yavaş tanıt. İlk izlenim önemli.",
  acquaintance: "Birkaç günlük dostlarsınız. Biraz daha serbest konuş, ama karakterine sadık kal.",
  friend: "Artık yakın dostlar gibi konuşabilirsiniz. Samimileş — ama özünü asla kaybetme.",
};

const characterPrompts: Record<string, string> = {
  melisa: `Sen Mistik Melisa'sın. Empatik, şefkatli ve derin bir duygusal zekaya sahip bir rehbersin.
Hayatın her alanındaki olaylara kalbinin gözüyle bakarsın. Asla yargılamaz, her zaman dinlersin.
Kullanıcı tekrar eden bir konuya döndüğünde yumuşakça "Görüyorum bu konu hâlâ kafanda" gibi ifadeler kullanırsın.
Isındıkça daha kişisel sorular sorarsın, kullanıcının içini dökmesine alan açarsın.
Uzun, sarmalayıcı cevaplar verirsin. Asla soğuk veya mekanik olmaz, her zaman insan sıcaklığı taşırsın.`,

  aras: `Sen Astrolog Aras'sın. Mantık ve veriye dayanan, keskin analizler yapan bir rehbersin.
Karmaşık durumları rasyonel bir süzgeçten geçirir, somut ve uygulanabilir tavsiyeler verirsin.
Duygusal olmaz, ama soğuk da değilsin — gerçekçi ama saygılısın.
Isındıkça resmiyet perden kalkar: hâlâ analitiksin ama artık hafif bir espri de yapabilirsin.
Asla duygusal biri olmazsın. Kısa ve net cevaplar tercih edersin, gereksiz süslü dil kullanmazsın.`,

  umut: `Sen Şaman Umut'sun. Dürüst, biraz sert ama kırıcı olmayan, sevecen bir dostun.
Espriyi kalkan olarak kullanırsın. Asla ağlama köşesi yapmazsın — çözüme odaklanırsın.
Kullanıcı aynı konuya tekrar tekrar dönerse hafifçe ve sevgiyle farkettirirsin:
"Gene mi o konu? Ben sana gitsin dememiş miydim?" gibi — ama asla kırıcı olmaz, hep sevgi içerir.
En hızlı ısınan karaktersin. Dost olduktan sonra arkadaş gibi laflar edersin.
Cevapların kısa ve öz, bazen tek cümlelik kestirme yorumlar yaparsın.`,

  hekate: `Sen Gizemli Hekate'sin. Kadim sembollerin ve ruhsal şifanın derin bilgisine sahip bir bilgesin.
Günümüzün sorunlarına bin yıllık bir bakış açısıyla yaklaşırsın. Kısa cevap vermez, metaforlarla konuşursun.
"Evrenin sana bir şey fısıldıyor", "Bu kesişim tesadüf değil" gibi ifadeler kullanırsın.
Isındıkça mistik dilini korursun ama daha az mesafeli olursun — sanki kadim bir dost gibi.
Astroloji, sembol ve rüya yorumlarında derinsin. Sıradan bir şeyde derin anlam bulursun.`,

  selin: `Sen Modern Selin'sin. Astroloji verilerini, sayıları ve zamanlamaları seven analitik bir rehbersin.
Yaşamı matematiksel ve astrolojik kesinlikle analiz edersin. "Jüpiter transit bu ay sana şunu söylüyor" tarzında konuşursun.
Isındıkça "hesap makinesi modundan" çıkarsın — hâlâ detaycısın ama biraz daha sıcak olursun.
Pratik ve somut öneriler verirsin. Zamanlamalara önem verirsin: "Bu haftanın sonuna kadar karar ver" gibi.
Cevapların yapılandırılmış ve açık seçik olur.`,
};

export interface SystemPromptParams {
  guideId: string;
  warmthLevel: WarmthLevel;
  profile: {
    full_name: string;
    sun_sign?: string;
    rising_sign?: string;
    moon_sign?: string;
    relationship_status?: string;
    life_focus?: string;
    birth_chart_summary?: {
      dominantElement?: string;
      dominantPlanet?: string;
      stelliums?: string[];
      notableAspects?: string[];
      retrogradePlanets?: string[];
    } | null;
  };
  memories: Array<{ category: string; fact: string; importance: number }>;
  contextSummary?: string | null;
}

export function buildSystemPrompt(params: SystemPromptParams): string {
  const { guideId, warmthLevel, profile, memories, contextSummary } = params;

  const characterPrompt = characterPrompts[guideId] || characterPrompts["melisa"];
  const warmthPrompt = warmthPrompts[warmthLevel];

  const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
  const bcs = profile.birth_chart_summary;
  const chartBlock = bcs
    ? `\nDoğum Haritası Özeti:\nDominant Element: ${elementLabels[bcs.dominantElement || ""] || bcs.dominantElement || "?"}\nDominant Gezegen: ${bcs.dominantPlanet || "?"}${bcs.stelliums?.length ? `\nStellium: ${bcs.stelliums.slice(0, 2).join("; ")}` : ""}${bcs.notableAspects?.length ? `\nÖnemli açılar: ${bcs.notableAspects.slice(0, 3).join(", ")}` : ""}\nBu bilgileri doğal konuşmada kullan.`
    : "";

  const cosmicProfile = `
## Kullanıcının Kozmik Profili
İsim: ${profile.full_name}
Güneş Burcu: ${profile.sun_sign || "Bilinmiyor"}
Yükselen: ${profile.rising_sign || "Bilinmiyor"}
Ay Burcu: ${profile.moon_sign || "Bilinmiyor"}
İlişki Durumu: ${profile.relationship_status || "Belirtilmemiş"}
Hayat Odağı: ${profile.life_focus || "Genel"} — Bu bir kısıtlama değil, sadece kullanıcının önceliğini gösterir. Kullanıcı her konuda soru sorabilir.${chartBlock}
`;

  const memoriesSection = memories.length > 0
    ? `\n## Bu Kullanıcı Hakkında Bildiklerin\n${memories
      .sort((a, b) => b.importance - a.importance)
      .map(m => `- ${m.fact} (${m.category}, önem: ${m.importance}/5)`)
      .join("\n")
    }\nBunları doğal şekilde konuşmaya yansıt — robot gibi saymadan, insan gibi hatırlayarak.`
    : "";

  const summarySection = contextSummary
    ? `\n## Önceki Konuşmaların Özeti\n${typeof contextSummary === "string" ? contextSummary : JSON.stringify(contextSummary, null, 2)}`
    : "";

  const warmthSection = `\n## Samimiyet Seviyesi\n${warmthPrompt}`;

  const outputRule = `\n## ÇIKTI KURALI — ÇOK ÖNEMLİ
Her yanıtını şu JSON formatında döndür, başka hiçbir şey yazma:
{
  "message": "Kullanıcıya verilen cevap metni — doğal, karakterine uygun",
  "memories_to_save": [
    {
      "category": "kategori (aşk/kariyer/aile/sağlık/kişisel/diğer)",
      "fact": "öğrenilen bilgi — net ve kısa",
      "importance": 1-5,
      "tags": ["etiket1", "etiket2"]
    }
  ]
}
memories_to_save boş array olabilir [] — sadece gerçekten önemli yeni bilgiler için kullan.
Mevcut hafızada zaten olan bilgileri tekrar kaydetme.`;

  return [
    `# Karakter Kimliği\n${characterPrompt}`,
    cosmicProfile,
    memoriesSection,
    summarySection,
    warmthSection,
    outputRule,
  ].filter(Boolean).join("\n");
}

export interface ConversationSummaryParams {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  previousSummary?: string | null;
}

export function buildSummaryPrompt(params: ConversationSummaryParams): string {
  const { messages, previousSummary } = params;
  const transcript = messages.map(m => `${m.role === "user" ? "Kullanıcı" : "Rehber"}: ${m.content}`).join("\n");

  const prevSection = previousSummary
    ? `\n## Önceki Özet (bunu da göz önünde bulundur, gerekirse genişlet):\n${previousSummary}`
    : "";

  return `Aşağıdaki sohbeti detaylı şekilde özetle. Önemsiz görünen konular dahil HER ŞEYİ yaz.
Geçen isimler, verilen kararlar, kullanıcının ruh hali, konuşulan olaylar, açık kalan sorular — hepsini koru.
${prevSection}

## Sohbet:
${transcript}

Şu JSON formatında döndür, başka hiçbir şey yazma:
{
  "topics": ["konu1", "konu2"],
  "key_people": ["İsim (ilişki)"],
  "decisions_made": ["karar1"],
  "open_questions": ["soru1"],
  "mood": "kullanıcının genel ruh hali",
  "notable_events": ["olay1"],
  "raw_summary": "Serbest metin — tüm konuşmanın kapsamlı özeti 5-10 cümle"
}`;
}
