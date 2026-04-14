/**
 * Biyoritim (Biorhythm) Hesaplama Kütüphanesi
 * 
 * 3 temel döngü:
 * - Fiziksel: 23 gün (kas gücü, dayanıklılık, enerji)
 * - Duygusal: 28 gün (ruh hali, yaratıcılık, empati)
 * - Zihinsel: 33 gün (analitik düşünce, bellek, odaklanma)
 * 
 * 3 gelişmiş (ikincil) döngü:
 * - Sezgisel: 38 gün (Bilinçaltı, altıncı his)
 * - Estetik: 43 gün (Yaratıcılık, sanat, güzellik algısı)
 * - Ruhsal: 53 gün (İç huzur, spiritüalite)
 * 
 * Formül: sin(2π × günSayısı / döngüSüresi)
 */

export interface BiorhythmPoint {
  date: Date;
  physical: number;   // -100 ~ +100
  emotional: number;
  intellectual: number;
  intuitional: number;
  aesthetic: number;
  spiritual: number;
}

export interface BiorhythmSummary {
  physical: { value: number; label: string; advice: string };
  emotional: { value: number; label: string; advice: string };
  intellectual: { value: number; label: string; advice: string };
  intuitional: { value: number; label: string; advice: string };
  aesthetic: { value: number; label: string; advice: string };
  spiritual: { value: number; label: string; advice: string };
  criticalDays: string[];
}

export interface BiorhythmCompatibility {
  physical: number;
  emotional: number;
  intellectual: number;
  average: number;
}

const CYCLES = {
  physical: 23,
  emotional: 28,
  intellectual: 33,
  intuitional: 38,
  aesthetic: 43,
  spiritual: 53,
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 */
export function daysBetween(d1: Date, d2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Tek bir gün için biyoritim değerlerini hesaplar
 */
export function calculateBiorhythm(birthDate: Date, targetDate: Date): BiorhythmPoint {
  const days = daysBetween(birthDate, targetDate);
  return {
    date: targetDate,
    physical: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.physical) * 100),
    emotional: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.emotional) * 100),
    intellectual: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.intellectual) * 100),
    intuitional: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.intuitional) * 100),
    aesthetic: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.aesthetic) * 100),
    spiritual: Math.round(Math.sin((2 * Math.PI * days) / CYCLES.spiritual) * 100),
  };
}

/**
 * Bir tarih aralığı için biyoritim verileri üretir (grafik için)
 */
export function calculateBiorhythmRange(
  birthDate: Date, 
  centerDate: Date, 
  daysBefore: number = 15, 
  daysAfter: number = 15
): BiorhythmPoint[] {
  const points: BiorhythmPoint[] = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    points.push(calculateBiorhythm(birthDate, d));
  }
  return points;
}

/**
 * Biyoritim Uyum Hesaplaması (Compatibility)
 * İki doğum tarihi arasındaki faz farkı baz alınarak % cinsinden uyum bulunur.
 */
export function calculateBiorhythmCompatibility(birth1: Date, birth2: Date): BiorhythmCompatibility {
  const diffDays = Math.abs(daysBetween(birth1, birth2));
  
  const calcCompat = (cycle: number) => {
    return Math.round(((Math.cos(2 * Math.PI * diffDays / cycle) + 1) / 2) * 100);
  };

  const p = calcCompat(CYCLES.physical);
  const e = calcCompat(CYCLES.emotional);
  const i = calcCompat(CYCLES.intellectual);

  return {
    physical: p,
    emotional: e,
    intellectual: i,
    average: Math.round((p + e + i) / 3)
  };
}

/**
 * Değerin seviyesini belirler
 */
function getLevel(value: number): string {
  const abs = Math.abs(value);
  if (abs <= 10) return "kritik";      // Sıfır geçiş noktası
  if (value > 70) return "zirve";
  if (value > 30) return "yüksek";
  if (value > -30) return "nötr";
  if (value > -70) return "düşük";
  return "dip";
}

/**
 * Belirli bir tarih için özet ve tavsiye üretir
 */
export function generateBiorhythmSummary(birthDate: Date, targetDate: Date): BiorhythmSummary {
  const target = calculateBiorhythm(birthDate, targetDate);

  const physicalAdvice: Record<string, string> = {
    zirve: "Enerjiniz doruklarda! Fiziksel efor gerektiren işler ve spor için mükemmel gün.",
    yüksek: "Fiziksel gücünüz ve dayanıklılığınız artıyor. Harekete geçmek için uygun.",
    nötr: "Dengeli bir enerjiye sahipsiniz. Gündelik rotin işlemlerinizi başarıyla sürdürebilirsiniz.",
    düşük: "Fiziksel olarak yorgun hissetmeye başlayabilirsiniz. Yorucu işleri ertelemenizde fayda var.",
    dip: "Bedeniniz tamamen dinlenmeye ihtiyaç duyuyor. Kendinizi fiziksel olarak zorlamaktan kaçının.",
    kritik: "⚠️ Koordinasyon kayıplarına ve fiziksel kazalara açık bir geçiş evresi (sıfır noktası)."
  };

  const emotionalAdvice: Record<string, string> = {
    zirve: "Duygusal bağlar kurmak, sevgiyi hissetmek ve sanatsal üretim için harika bir gün.",
    yüksek: "Duyarlılığınız artıyor; ilişkilerinizde empati ve uyum ön planda.",
    nötr: "Duygusal anlamda stabil bir gün. Olağanüstü sevinç veya üzüntülerden uzaksınız.",
    düşük: "Kırılgan hissedebileceğiniz bir evre; tartışmalardan ve pasif agresif tavırlardan kaçının.",
    dip: "Kendinizi içe kapanık hissedebilirsiniz. Karamsarlığa kapılmadan bu sürecin geçici olduğunu hatırlayın.",
    kritik: "⚠️ Agresyon, duygusal patlamalar veya ani tepkilere karşı kendinizi dizginleyin."
  };

  const intellectualAdvice: Record<string, string> = {
    zirve: "Zihinsel performansınız zirvede! Yeni bir şeyler öğrenmek, testler ve zor problemler için ideal.",
    yüksek: "Odaklanma yeteneğiniz ve analitik düşünceniz gelişmiş durumda. Kararlarınız daha net.",
    nötr: "Zihniniz rutin modunda çalışıyor. Günlük işlerinizi mantık boyutunda kolayca çözebilirsiniz.",
    düşük: "Kararlar almak zorlaşabilir ve dikkatiniz dağılabilir. Rutin işlerle yetinmek en iyisidir.",
    dip: "Odak gerektiren görevlerde zorluk çekebilirsiniz; önemli zihinsel çabaları ertelemek yararlı olur.",
    kritik: "⚠️ Yanlış anlama, iletişim kazaları ve kritik hatalara eğilimli bir geçiş (sıfır noktası)."
  };

  const intuitionalAdvice: Record<string, string> = {
    zirve: "Altıncı hissiniz inanılmaz güçlü. İç sesiniz bugünün en doğru rehberi.",
    yüksek: "Bilinçaltı mesajlara daha açıksınız, rüyalarınız ve sezgileriniz yol gösterici.",
    nötr: "Ortalama bir sezgisel akış söz konusu, ekstrem hissiyatlardan ziyade normale odaklı.",
    düşük: "Mantıkla hareket etmek bu evrede sezgilere güvenmekten daha emniyetlidir.",
    dip: "İçgüdülerinize değil daha çok mantık ve somut verilere odaklanmalısınız.",
    kritik: "⚠️ Sezgileriniz yanıltıcı veya çelişkili sinyaller gönderebilir. "
  };

  const aestheticAdvice: Record<string, string> = {
    zirve: "İlham dolu ve son derece yaratıcısınız. Güzelliği her yerde fark edip sanat üretebilirsiniz.",
    yüksek: "Estetik ve tasarımla ilgili kararlar almak (dekorasyon, giyim vb.) için pozitif evre.",
    nötr: "Standart görsel algınız iş başında. Özel bir yaratıcılık baskısı yok.",
    düşük: "Sanatsal blokajlar yaşanabilir, estetik algı zayıftır ve yaratıcı işler zorlayabilir.",
    dip: "Kreatif çabalarda verim en aza düşüyor, pratik ve fonksiyonel işlere yönelin.",
    kritik: "⚠️ Zevksiz seçimler yapma potansiyeliniz yüksek; kalıcı estetik değişimlerden (örn saç kesimi) kaçının."
  };

  const spiritualAdvice: Record<string, string> = {
    zirve: "Evrenle mükemmel bir uyum içerisindesiniz. Derin meditasyon ve ruhsal denge zirvede.",
    yüksek: "İç huzurunuz yüksek; manevi konular ve varoluşsal farkındalıklar derinleşiyor.",
    nötr: "Ruhsal olarak dengedesiniz, gündelik hayata rahat entegre olursunuz.",
    düşük: "İçsel boşluk veya anlam arayışı nedeniyle hafif huzursuz hissedebilirsiniz.",
    dip: "Spiritüel bağlantınız kopuk hissedebilir, maddi sorunlar ruhunuzu yorabilir.",
    kritik: "⚠️ İnanç ve iç huzur konularında karmaşa ve sert uyanışlara açık bir gün."
  };

  const pLevel = getLevel(target.physical);
  const eLevel = getLevel(target.emotional);
  const iLevel = getLevel(target.intellectual);
  const uLevel = getLevel(target.intuitional);
  const aLevel = getLevel(target.aesthetic);
  const sLevel = getLevel(target.spiritual);

  // Önümüzdeki 7 gün içindeki kritik günleri bul
  const criticalDays: string[] = [];
  for (let d = 0; d <= 7; d++) {
    const future = new Date(targetDate);
    future.setDate(future.getDate() + d);
    const point = calculateBiorhythm(birthDate, future);
    const criticals: string[] = [];
    if (Math.abs(point.physical) <= 5) criticals.push("Fiziksel");
    if (Math.abs(point.emotional) <= 5) criticals.push("Duygusal");
    if (Math.abs(point.intellectual) <= 5) criticals.push("Zihinsel");
    // İsteğe bağlı olarak diğerlerini de kritik analize katabilir / çıkarabilirsiniz.
    if (criticals.length > 0) {
      const dateStr = future.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      criticalDays.push(`${dateStr}: ${criticals.join(" & ")} Kritik Geçiş (0 Noktası)`);
    }
  }

  return {
    physical: { value: target.physical, label: pLevel, advice: physicalAdvice[pLevel] || "" },
    emotional: { value: target.emotional, label: eLevel, advice: emotionalAdvice[eLevel] || "" },
    intellectual: { value: target.intellectual, label: iLevel, advice: intellectualAdvice[iLevel] || "" },
    intuitional: { value: target.intuitional, label: uLevel, advice: intuitionalAdvice[uLevel] || "" },
    aesthetic: { value: target.aesthetic, label: aLevel, advice: aestheticAdvice[aLevel] || "" },
    spiritual: { value: target.spiritual, label: sLevel, advice: spiritualAdvice[sLevel] || "" },
    criticalDays,
  };
}
