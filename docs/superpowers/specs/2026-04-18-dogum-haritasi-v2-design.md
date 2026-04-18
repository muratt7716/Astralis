# Doğum Haritası v2 — Tasarım Dökümanı

**Tarih:** 2026-04-18
**Hedef:** Mevcut sığ doğum haritası sayfasını Astro-Seek seviyesine taşımak + Mistik Rehber ile otomatik entegrasyon.

---

## 1. Genel Mimari

Üç katman birlikte değişir:

```
src/lib/astrology.ts          → Motor genişletme
src/app/dogum-haritasi/page.tsx → UI yeniden tasarım
src/lib/guide-prompts.ts      → Katman 2 güncelleme (harita verisi)
src/app/api/birth-chart/interpret/route.ts → Yeni AI yorum endpoint
sql/schema.sql                → profiles.birth_chart_summary JSONB kolonu
```

---

## 2. astrology.ts Motor Geliştirmeleri

### 2a. BirthChart Interface Genişletmesi

```ts
export interface BirthChart {
  // Mevcut alanlar korunur
  sunSign, moonSign, risingSign, planetPositions, houses, aspects, transits

  // YENİ alanlar:
  planetsByHouse: Record<number, string[]>      // { 1: ["mars", "venus"], 5: ["sun"] }
  houseRulerships: HouseRulership[]             // Her ev için yönetici bilgisi
  elementBalance: ElementBalance                // Ateş/Toprak/Hava/Su %
  modalBalance: ModalBalance                    // Cardinal/Fixed/Mutable %
  dominantPlanet: string                        // En baskın gezegen ID
  stelliums: Stellium[]                         // 3+ gezegen aynı burçta
  retrogradeCount: number                       // Retrograde gezegen sayısı
}

export interface HouseRulership {
  house: number           // Ev numarası (1-12)
  signId: string          // O evdeki burç
  rulerPlanetId: string   // Burcun yöneticisi gezegen
  rulerHouse: number      // Yönetici gezegenin bulunduğu ev
  rulerSign: string       // Yönetici gezegenin burcu
  rulerRetrograde: boolean
}

export interface ElementBalance {
  fire: number    // % (0-100)
  earth: number
  air: number
  water: number
  dominant: "fire" | "earth" | "air" | "water"
}

export interface ModalBalance {
  cardinal: number  // %
  fixed: number
  mutable: number
  dominant: "cardinal" | "fixed" | "mutable"
}

export interface Stellium {
  signId: string
  planets: string[]   // 3+ gezegen ID
}
```

### 2b. Aspect Interface Genişletmesi

```ts
export interface Aspect {
  // Mevcut alanlar korunur
  // YENİ:
  applying: boolean    // true = yaklaşıyor, false = uzaklaşıyor
  interpretation: string  // Türkçe derin yorum metni (statik, kişiselleştirilmemiş)
}
```

### 2c. Yeni Hesaplama Fonksiyonları

- `calculateHouseRulerships(houses, planetPositions)` — Burç→yönetici tablosundan yönetici gezegenin evini bulur
- `calculateElementBalance(planetPositions)` — 10 gezegenin burçlarından % hesaplar
- `calculateModalBalance(planetPositions)` — Nitelik % hesaplar
- `calculateDominantPlanet(planetPositions, aspects, houses)` — En çok açı + ev etkisi olan gezegen
- `detectStelliums(planetPositions)` — Aynı burçta 3+ gezegen grupları
- `detectApplying(aspect, planetPositions)` — Hız vektörü karşılaştırmasıyla yön tespiti

**Burç→Yönetici Tablosu (statik):**
```ts
const SIGN_RULERS: Record<string, string> = {
  koc: "mars", boga: "venus", ikizler: "merkur", yengec: "ay",
  aslan: "gunes", basak: "merkur", terazi: "venus", akrep: "pluto",
  yay: "jupiter", oglak: "saturn", kova: "uranus", balik: "neptun"
}
```

---

## 3. Sayfa Yapısı — 5 Sekme

### Sekme 1: Özet (yeni)
- **Unsur Dengesi** — 4 bar (Ateş/Toprak/Hava/Su) + dominant element açıklaması
- **Nitelik Dengesi** — 3 bar (Cardinal/Fixed/Mutable) + açıklama
- **Dominant Gezegen** — Kart: isim + burç + ev + ne anlama geldiği
- **Stellium(lar)** — Varsa: "X burcu stelliumu: Mars, Venüs, Merkür" + kısa anlam
- **Retrograde Özeti** — Kaç gezegen retrograde, hangileri, genel etki
- **Harita Kişiliği** — 2-3 cümle: en belirgin 3 özelliği birleştiren özet metin (statik, template tabanlı)

### Sekme 2: Gezegenler (geliştirilmiş)
Mevcut kart yapısı korunur, şu eklenir:
- **Ev bilgisi** — "3. Ev" etiketi her gezegen kartında
- **Retrograde** — Sadece ℞ sembolü değil, "Retrograde: Bu gezegen içe dönük çalışır, yeniden değerlendirme enerjisi taşır" açıklaması
- **Derin yorum** — Mevcut statik metinler korunur (i18n key'leri)

### Sekme 3: Evler (geliştirilmiş)
Her ev kartı şunları içerir:
- Ev numarası + yaşam alanı adı ("1. Ev — Kimlik & Dış Görünüş")
- Hangi burç bu evi kesiyor + derece
- **Yönetici gezegen** — "Bu evin yöneticisi: Mars (Koç'ta, 5. Ev'de)" formatında
- **Bu evdeki gezegenler** — Varsa: küçük gezegen chip'leri
- Kısa açıklama metni

### Sekme 4: Açılar (geliştirilmiş)
- Her açıda **applying/separating** etiketi: "Yaklaşıyor ↗" veya "Uzaklaşıyor ↘"
- Harmony filtresi (Tümü / Uyumlu / Zorlu / Nötr)
- Her açı için daha derin yorum metni (statik, i18n'den)
- Açı sayısı özeti üstte

### Sekme 5: AI Yorumu (yeni endpoint)
- "Haritamı Yorumla" butonu
- `/api/birth-chart/interpret` endpoint'i çağrılır
- Gemini'ye tüm harita verisi gönderilir: big three, gezegen+ev+burç listesi, önemli açılar, ev yöneticilikleri, element dengesi
- Kişiselleştirilmiş, paragraf bazlı Türkçe yorum döner
- Bölümler: Genel Karakter, Güçlü Yönler, Dikkat Alanları, Öneriler
- Mevcut transit yorumu butonu bu sekmeye taşınır

---

## 4. Yeni API Endpoint

### `POST /api/birth-chart/interpret`

**Request:**
```json
{
  "chart": { ...BirthChart },
  "language": "tr"
}
```

**Gemini prompt yapısı:**
```
Kullanıcının doğum haritasını Türkçe olarak yorumla.
Teknik terimler kullan ama her birini açıkla.
Kişisel, sıcak ve anlayışlı bir dil kullan.

Harita verileri:
- Güneş: [burç] [ev]. ev
- Ay: [burç] [ev]. ev
- Yükselen: [burç]
- [tüm gezegenler...]
- Önemli açılar: [...]
- Unsur dengesi: [...]
- Dominant gezegen: [...]

Şu bölümleri JSON olarak döndür:
{
  "general": "Genel karakter analizi (3-4 paragraf)",
  "strengths": "Güçlü yönler (2-3 paragraf)",
  "challenges": "Dikkat alanları (2 paragraf)",
  "advice": "Kişisel öneriler (1-2 paragraf)"
}
```

**Rate limit:** Mevcut `checkRateLimit` kullanılır.

---

## 5. Mistik Rehber Otomatik Sync

### 5a. DB Değişikliği
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_chart_summary JSONB DEFAULT NULL;
```

### 5b. Sync Akışı
Kullanıcı hesapla butonuna basıp sonuç geldiğinde (sadece giriş yapmış kullanıcı):

1. **`profiles.birth_chart_summary` güncelle:**
```json
{
  "calculatedAt": "ISO timestamp",
  "sunSign": "aslan", "moonSign": "akrep", "risingSign": "kova",
  "dominantPlanet": "saturn", "dominantElement": "toprak",
  "stelliums": ["yay stelliumu: jüpiter, mars, merkür"],
  "notableAspects": ["güneş kare saturn (zorlu)", "venüs üçgen jüpiter (uyumlu)"],
  "retrogradeplanets": ["saturn", "neptun"],
  "houseHighlights": ["güneş 7. evde", "ay 12. evde"]
}
```

2. **`memories` tablosuna kilit bulgular yaz** (category: "astroloji", importance: 4, guide_id = her aktif rehber):
- "Doğum haritasında dominant element: Toprak — pratik, sabırlı, kararlı yapı"
- "Dominant gezegen Saturn — sorumluluk, disiplin ve sınırlar temasını taşıyor"
- Stellium varsa: "Yay stelliumu var (Jüpiter + Mars + Merkür) — özgürlük ve macera enerjisi yoğun"

3. **`guide-prompts.ts` Layer 2 güncelleme:**
```ts
// Mevcut kozmik profil bölümüne eklenir:
const chartSummary = profile.birth_chart_summary
  ? `\nDoğum Haritası Özeti (otomatik hesaplanmış):
     Dominant Element: ${chartSummary.dominantElement}
     Dominant Gezegen: ${chartSummary.dominantPlanet}
     ${chartSummary.stelliums?.length ? "Stellium: " + chartSummary.stelliums.join(", ") : ""}
     Dikkat çekici: ${chartSummary.notableAspects?.slice(0, 3).join(", ")}
     Bu bilgileri doğal konuşmada kullan — robot gibi sayma.`
  : "";
```

---

## 6. Değiştirilecek / Oluşturulacak Dosyalar

| Dosya | İşlem |
|---|---|
| `src/lib/astrology.ts` | Genişletme — yeni interface'ler + hesaplama fonksiyonları |
| `src/app/dogum-haritasi/page.tsx` | Komple yeniden yazım |
| `src/app/api/birth-chart/interpret/route.ts` | Yeni dosya |
| `src/lib/guide-prompts.ts` | Layer 2'ye birth_chart_summary ekleme |
| `sql/schema.sql` | `profiles.birth_chart_summary JSONB` kolonu |

---

## 7. Kapsam Dışı (Bu Fazda Yapılmayacaklar)

- PDF export
- Paylaşım linki
- Synastry / Solar Return / Lunar Return
- Harmonik haritalar
- Sabit yıldızlar
- Arabic Parts / Sabian sembolleri
- Sidereal / Vedik astroloji
- Çoklu ev sistemi seçimi

---

## 8. Doğrulama Kriterleri

- [ ] Ev yöneticisi hesaplaması Astro-Seek çıktısıyla tutarlı
- [ ] Element dengesi % toplamı 100'e eşit
- [ ] Stellium tespiti 3+ gezegen için doğru çalışıyor
- [ ] Applying/separating tespiti doğru (yaklaşan açı orb'u küçülmeli)
- [ ] Giriş yapmış kullanıcıda harita hesaplanınca `birth_chart_summary` güncelleniyor
- [ ] Memories tablosuna astroloji kayıtları yazılıyor
- [ ] Mistik Rehber konuşmasında harita bilgileri doğal şekilde kullanılıyor
- [ ] AI yorum endpoint'i rate limit'e takılmadan çalışıyor
- [ ] Tüm sekmelerde mobil görünüm düzgün
