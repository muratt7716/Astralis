# Horary Astroloji Modülü — Tasarım Dokümanı

**Tarih:** 2026-04-20
**Durum:** Onaylandı
**Hedef Kitle:** "Biraz bilen" kullanıcı

---

## 1. Genel Bakış

### Horary Nedir?

Horary astroloji, bir sorunun sorulduğu tam anda çekilen gökyüzü haritasını yorumlayan kadim bir dal. "Horary" Latince *hora* (saat) kelimesinden gelir. Natal astrolojiden farklı olarak kişiyi değil, **soruyu** okur.

**Tarihsel Köken:**
- Babilliler ile başlar, Helenistik dönemde (MÖ 300 – MS 400) sistematik hale gelir
- İslam Altın Çağı'nda (700–1200) Māshā'allāh, Sahl ibn Bishr, Ebû Maşer tarafından geliştirilir
- Orta Çağ Avrupası'nda Guido Bonatti (1210–1296) tarafından kurallaştırılır
- **William Lilly (1602–1681)** — *Christian Astrology* (1647) ile en kapsamlı İngilizce referans eserini yazar; modern horary'nin temeli

**Modern Ustalar:**
- **John Frawley** — *The Horary Textbook* (2005/2014), günümüzün en saygın geleneksel horary astrologu
- **Deborah Houlding** — Skyscript.co.uk, *The Houses: Temples of the Sky*, STA diploma programı
- **Olivia Barclay (1919–2001)** — Lilly'yi yeniden yayınlayan, QHP sertifika programını kuran kişi
- **Anthony Louis** — *Horary Astrology Plain and Simple*, modern/geleneksel köprü
- **Barbara Dunn** — *Horary Astrology Re-Examined*, katı geleneksel yaklaşım

---

## 2. Ürün Kararları

| Karar | Seçim |
|---|---|
| URL | `/horary` — bağımsız modül |
| Soru girişi | Serbest metin (AI kategori tespit eder) |
| Harita görseli | Evet — wheel render edilir |
| Hedef kitle | "Biraz bilen" — görsel + açıklama dengeli |
| Derinlik | YouTube uzman analizi seviyesinde — 5 bölüm yapılandırılmış yorum |
| Dil | TR / EN / AR / DE / FR |

---

## 3. Teknik Mimari

### Yaklaşım: Hibrit (Gerçek Hesap + AI Yorum)

```
Kullanıcı [soru + koordinat]
    ↓
/api/horary [POST]
    ├── astronomia → gerçek gezegen pozisyonları (şu anki an)
    ├── Regiomontanus ev hesabı
    ├── Lilly kuralları:
    │     ├── Strictures (ASC derecesi, VOC Ay, Via Combusta, Satürn 7. ev)
    │     ├── Significator atama (soru kategorisine göre ev belirle)
    │     ├── Essential dignities (domicile, exalt, trip, term, face, detriment, fall)
    │     ├── Accidental dignities (ev gücü, retrograde, combustion, cazimi)
    │     └── Applying aspects (perfection var mı? hangi gezegen araya giriyor?)
    └── Ham veri → Gemini (5 bölüm, tek istek, dil parametreli)
         ↓
JSON: { chartData, strictures, significators, reading:{s1..s5}, timing }
         ↓
Frontend → Wheel + 5 kart
```

### Dosya Yapısı

```
src/
├── app/
│   ├── horary/
│   │   └── page.tsx
│   └── api/
│       └── horary/
│           └── route.ts
└── lib/
    └── horary/
        ├── engine.ts       ← astronomia ile gezegen + ev hesabı
        ├── rules.ts        ← Lilly kuralları (strictures, dignities, significators, aspects)
        └── prompt.ts       ← Gemini prompt şablonları (5 bölüm, 5 dil)
```

### Teknik Seçimler

| Bileşen | Seçim | Gerekçe |
|---|---|---|
| Gezegen hesabı | `astronomia` npm paketi | Hafif, server-side, yüksek doğruluk |
| Ev sistemi | Regiomontanus | Lilly/Frawley geleneği, horary standardı |
| Gezegen seti | 7 klasik (Güneş, Ay, Merkür, Venüs, Mars, Jüpiter, Satürn) | Strict traditional |
| AI | Gemini (mevcut `callGeminiWithFallback`) | Projede zaten var |
| Harita render | SVG — BirthChartWheel baz alınır, horary varyantı | Tutarlı görünüm |
| i18n | Mevcut locale sistemi (tr/en/ar/de/fr) | Yeni `horary.*` key'leri eklenir |

---

## 4. Horary Kuralları (Engine)

### Strictures Against Judgment (Lilly)

| Stricture | Kural | Görüntü |
|---|---|---|
| Early ASC | ASC < 3° | ⚠️ Uyarı |
| Late ASC | ASC > 27° | ⚠️ Uyarı |
| Void of Course Moon | Ay burç değiştirmeden önce major aspect yapmıyor | ⚠️ Uyarı |
| Via Combusta | Ay 15° Terazi – 15° Akrep arasında | ⚠️ Uyarı |
| Saturn in 7th | Satürn 7. evde | ⚠️ Bilgi notu |

Stricture = okuma iptal değil, **uyarı kartı**. AI yoruma "bu stricture var, bunu yoruma dahil et" geçilir.

### Significator Atama

AI soruyu alır → kategori tespit eder → ilgili ev belirlenir:

| Konu | Ev | Significator |
|---|---|---|
| Querent (sorucı) | 1. ev | ASC yöneticisi + Ay |
| İlişki / partner | 7. ev | DSC yöneticisi |
| Kariyer | 10. ev | MC yöneticisi |
| Para | 2. ev | 2. ev yöneticisi |
| Sağlık | 6. ev | 6. ev yöneticisi |
| Kayıp eşya | 2. ev (kişisel) veya 4. ev | Koşula göre |
| Ev / mülk | 4. ev | 4. ev yöneticisi |
| Yolculuk | 9. ev | 9. ev yöneticisi |
| Hukuk | 7. ev | 7. ev yöneticisi |
| Çocuk | 5. ev | 5. ev yöneticisi |

### Essential Dignities Tablosu

7 klasik gezegen için tam Lilly dignity tablosu uygulanır (domicile +5, exalt +4, trip +3, term +2, face +1, detriment -5, fall -4, peregrine 0).

### Aspect Kuralları

- Sadece **applying** (yaklaşan) aspectler geçerli
- Major Ptolemaic aspectler: conjunction, sextile, square, trine, opposition
- Orb: gezegene göre (Güneş/Ay 10°, Venüs/Jüp 8°, Mars/Sat 9°, Merkür 7°)
- **Perfection:** İki significator arasındaki aspect exact olmadan önce burç değişimi var mı?
- **Translation of Light** ve **Collection of Light** tespiti

### Timing

Aspect arc'ı (kaç derece kaldı) × zaman birimi:
- Cardinal burç + angular ev → günler
- Fixed burç + succedent ev → haftalar/aylar
- Mutable burç + cadent ev → aylar/yıllar

---

## 5. AI Yorum Sistemi

### 5 Bölüm Yapısı

Her bölüm Gemini'ye **ayrı talimatla** geçilir, tek API isteğinde:

```
Bölüm 1 — "Haritanın İlk Sesi"
  → Strictures, genel atmosfer, harita güvenilir mi?
  → Ton: dikkatli, gözlemci

Bölüm 2 — "Sen ve Konu"
  → Querent significator'u (ASC yöneticisi + Ay) ve quesited significator
  → Dignity durumu, güçlü mü zayıf mı, ne anlama geliyor
  → Ton: açıklayıcı, kişisel

Bölüm 3 — "Gezegenler Ne Anlatıyor?"
  → Ay'ın durumu ve son/sonraki aspectleri
  → Ana aspect: perfection var mı, engel var mı
  → Translation/collection varsa belirt
  → Ton: analitik, adım adım

Bölüm 4 — "Cevap"
  → Net yön: Evet / Hayır / Belirsiz / Zaman İster
  → 2-3 paragraf gerekçe
  → Ton: kararlı, uzman, dürüst

Bölüm 5 — "Zaman ve Tavsiye"
  → Timing tahmini (derece × birim)
  → Kullanıcıya pratik yönlendirme
  → Ton: yapıcı, destekleyici
```

### Sistem Promptu Prensibi

- Lilly + Frawley geleneği açıkça belirtilir
- Ham hesap verisi (gezegen dereceleri, dignities, aspect açıları) tam olarak geçilir
- "Yorumla" değil: "Bu veriyi Lilly geleneğiyle adım adım analiz et, her kararı gerekçelendir"
- Dil parametresi: `{language}` — 5 dil
- Her bölümün minimum kelime hedefi belirlenir (Bölüm 4: min 200 kelime)

---

## 6. Görsel Tasarım

### Renk Paleti

| Renk | Kod | Kullanım |
|---|---|---|
| Derin lacivert | `#0a0a1a` → `#0d1424` | Arka plan (global ile uyumlu) |
| Amber/Altın | `#c9a84c` | Ana accent, başlıklar, vurgu |
| Bakır | `#b87333` | İkincil accent |
| Cam koyu | `rgba(255,255,255,0.05)` | Kart arka planı |
| Uyarı amber | `rgba(201,168,76,0.15)` | Stricture kartları |

### Tipografi

| Kullanım | Font | Neden |
|---|---|---|
| Başlıklar | `Cinzel` (Google Fonts) | Roma gravür hissi, Latin astroloji geleneği |
| Gövde metin | `EB Garamond` | Tarihi manuscript estetiği, uzun okuma |
| Derece değerleri | `JetBrains Mono` | Teknik hassasiyet hissi |

### Global Arka Plan

Değiştirilmez — mevcut `GlobalBackground` komponenti korunur.

### Horary Wheel

- Mevcut `BirthChartWheel` baz alınır, horary varyantı oluşturulur
- Significator gezegenleri: altın halka vurgusu
- Applying aspect çizgileri: pulse animasyonu
- Ev numaraları: Romen rakamı (I, II, III…)

### Kart Animasyonları

- 5 kart staggered fade-in (Framer Motion, mevcut proje)
- Kart 4 (Cevap): daha büyük, amber border
- Yükleme ekranı: adım adım mesajlar

### Footer Notu

Her sonuç sayfasında: *"Bu okuma William Lilly'nin Christian Astrology (1647) geleneğine dayanmaktadır."* (5 dilde)

---

## 7. i18n Genişlemesi

Tüm 5 locale dosyasına (`tr.ts`, `en.ts`, `ar.ts`, `de.ts`, `fr.ts`) `horary.*` key namespace'i eklenir:

- `horary.hero.title`
- `horary.hero.subtitle`
- `horary.form.question_placeholder`
- `horary.form.submit`
- `horary.loading.step1` ... `step4`
- `horary.result.section1_title` ... `section5_title`
- `horary.result.stricture_ok`
- `horary.result.stricture_warning`
- `horary.result.footer_note`
- `horary.result.timing_label`
- `horary.result.answer_yes` / `answer_no` / `answer_unclear`

---

## 8. Kapsam Dışı

- Uranus, Neptune, Pluto (modern gezegenler) — traditional horary'de yok
- Fixed star analizi — ileriki versiyon
- Kullanıcı geçmişi / kaydetme — ileriki versiyon
- Ücretli/premium kısıtlama — ayrı karar
