# Astroloji Motoru — Astro-Seek Gap Analysis (v2 sonrası güncel durum)

> Son güncelleme: 2026-04-18
> Referans: Kullanıcının Astro-Seek çıktısı (Bursa, 11 Kasım 1982, 06:27)

---

## 1. Mevcut Durum — v2 Sonrası Tamamlananlar ✅

| Özellik | Durum |
|---------|-------|
| Element Dengesi (Ateş/Toprak/Hava/Su) | ✅ Tamamlandı |
| Nitelik Dengesi (Cardinal/Fixed/Mutable) | ✅ Tamamlandı |
| Dominant Gezegen | ✅ Tamamlandı |
| Stellium tespiti (3+ gezegen aynı burçta) | ✅ Tamamlandı |
| Retrograde tespiti | ✅ Tamamlandı |
| Applying / Separating açı tespiti | ✅ Tamamlandı |
| Ev yöneticisi (hangi gezegen, hangi evde) | ✅ Tamamlandı |
| Gezegenlerin evlere dağılımı (planetsByHouse) | ✅ Tamamlandı |
| Aspect filtreleme (Uyumlu/Zorlu/Nötr) | ✅ Tamamlandı |
| Mistik Rehber otomatik senkron | ✅ Tamamlandı |
| Harita yorumu (Gemini tabanlı) | ✅ Tamamlandı |

---

## 2. Gap Analysis — Astro-Seek'te Olan, Bizde Eksik ❌

### 2A. Ev Sistemi

| | Astro-Seek | Bizim Durum |
|--|--|--|
| **Sistem** | Placidus | Equal House |
| **Fark** | Ev cusps'ları eşit değil, doğum yerine göre hesaplanır | Her ev tam 30° |

> **Etki:** Placidus'ta evler gerçek gök kubbesiyle hizalanır. Özellikle yüksek/alçak enlemlerde çok farklı sonuçlar verir. Astroloji camiasının standart sistemi Placidus'tur.

---

### 2B. Eksik Gök Cisimleri

Astro-Seek şu ek objeleri hesaplıyor, bizde hiçbiri yok:

| Cisim | Astro-Seek Çıktısı (örnek) | Açıklama |
|-------|---------------------------|----------|
| **Kuzey Düğümü (North Node)** | Cancer 6°32', Retrograde, 9. Ev | Ruhun büyüme yönü |
| **Güney Düğümü (South Node)** | Capricorn (karşı nokta) | Alışkanlık ve geçmiş |
| **Lilith (Black Moon)** | Capricorn 15°53', 3. Ev | Bastırılmış içgüdüler |
| **Chiron** | Taurus 25°32', Retrograde, 7. Ev | "Yaralı Şifacı" |
| **Kısmet Noktası (Part of Fortune)** | Sagittarius 25°56', 2. Ev | Maddi/ruhsal zenginlik |
| **Vertex** | Gemini 11°03', 8. Ev | Kader noktası |

---

### 2C. Açı Sistemi — Eksik Açılar

**Şu an hesaplanan açılar:** Conjunction, Opposition, Square, Trine, Sextile (5 temel açı)

**Astro-Seek'te ek olarak:**

#### Açılara Dahil Edilmesi Gereken Noktalar (şu an yok):
- ASC (Ascendant) açıları — örn. `Ascendant Conjunction Saturn (4°23', Separating)`
- DSC (Descendant) açıları — örn. `DSC Trine Mars`
- MC (Midheaven) açıları — örn. `MC Square Mercury (4°55', Applying)`
- IC (Imum Coeli) açıları — örn. `IC Square Mercury`
- Node açıları — `Node Opposition Mars`
- Chiron açıları, Fortune açıları, Vertex açıları

#### Minör (Harmonik) Açılar (şu an yok):
| Açı | Derece | Orb |
|-----|--------|-----|
| Semisextile | 30° | ±1° |
| Quincunx (Inconjunct) | 150° | ±2° |
| Semisquare | 45° | ±1° |
| Sesquisquare | 135° | ±1° |
| Quintile | 72° | ±1° |
| Biquintile | 144° | ±1° |
| Septile | 51°25' | ±1° |
| Novile | 40° | ±1° |
| Decile | 36° | ±1° |

---

### 2D. Deklinasyon Açıları (Parallels & Contra-Parallels)

Şu an hiç hesaplanmıyor. Astro-Seek çıktısında mevcut:

```
Sun Parallel Venus (0°04')        → Kavuşum etkisi gibi güçlü
Sun Parallel Jupiter (0°17')      → Kavuşum etkisi
Venus Parallel Jupiter (0°12')    → Kavuşum etkisi
MC Contra-Parallel Sun (0°52')    → Karşıtlık etkisi gibi
MC Contra-Parallel Venus (0°56')
Node Contra-Parallel Neptune (1°08')
```

> **Nasıl Hesaplanır:** Her gezegenin ekliptik deklinasyon açısı (°N/°S) hesaplanır. İki gezegen aynı deklinasyondaysa Parallel, zıt değerlerdeyse Contra-Parallel.

---

### 2E. Ay Fazı (Moon Phase)

Astro-Seek çıktısında:
```
Third Quarter Moon (Waning Moon) — Phase Degree: 306°24'
```

8 faz: New Moon, Crescent, First Quarter, Gibbous, Full Moon, Disseminating, Third Quarter, Balsamic

> **Hesaplama:** Moon longitude - Sun longitude = faz açısı (0-360°). 0°=Yeni Ay, 180°=Dolunay, 270°=Son Dördün vs.

---

### 2F. Gezegen Fazları — Morning Star / Evening Star

Astro-Seek çıktısında her gezegen için:
```
Sun-Moon: 306°24' (Morning Star / Oriental)
Sun-Venus: 1°46' (Evening Star / Occidental)
Sun-Mars: 49°13' (Evening Star)
```

> **Hesaplama:** Gezegen longitude'u ile Güneş longitude'u arasındaki açı. 0-180° arası = Evening Star (Batıda, akşam görünür), 180-360° arası = Morning Star (Doğuda, sabah görünür).

---

### 2G. Hassas Dereceler (Sensitive Degrees) Tablosu

Tüm 12 burç × 30 derece ızgarasında hangi derecelerin "hassas" (gezegen/ev cusp'ı olan) olduğunu gösteren görsel tablo. Bizde hiç yok.

---

### 2H. ASC ve MC'ye Özel Yorum Bölümü

Astro-Seek'te ayrı bir bölüm var:

```
1. ASC burcu yorumu (Akrep ASC)
2. ASC yöneticisi yorumu:
   - Yönetici gezegen: Pluto
   - Pluto'nun burcu: Terazi → yorum
   - Pluto'nun evi: 12. Ev → yorum
3. ASC'deki gezegenler listesi: Güneş, Merkür, Venüs, Jüpiter
4. ASC açıları: Saturn Kavuşumu, Pluto Kavuşumu, Node Trigonu

5. MC burcu yorumu (Aslan MC)
6. MC yöneticisi yorumu:
   - Yönetici: Güneş
   - Güneş'in evi: 1. Ev → yorum
7. MC açıları: Mercury Karesi, Uranus Üçgeni
```

Bizde Houses tabı bu bilgilerin bir kısmını gösteriyor ama yorum metni yok.

---

### 2I. Kuzey/Güney Düğüm Yorumları

```
North Node in Cancer (9th House):
- Cancer'da olmasının anlamı
- 9. evde olmasının anlamı
```

Bizde Node hesabı yok.

---

## 3. Öncelik Sıralaması (Kullanıcıya Sunulacak)

| Öncelik | Özellik | Zorluk | Etki |
|---------|---------|--------|------|
| 🔴 P1 | North/South Node hesabı | Orta | Yüksek |
| 🔴 P1 | Part of Fortune hesabı | Kolay | Yüksek |
| 🔴 P1 | ASC/MC açıları (aspect listesine dahil) | Orta | Yüksek |
| 🟡 P2 | Lilith hesabı | Orta | Orta |
| 🟡 P2 | Chiron hesabı | Orta | Orta |
| 🟡 P2 | Ay Fazı gösterimi | Kolay | Orta |
| 🟡 P2 | Morning Star / Evening Star | Kolay | Orta |
| 🟠 P3 | Quincunx, Semisquare, Sesquisquare minör açılar | Kolay | Orta |
| 🟠 P3 | Deklinasyon / Parallel-Contra-Parallel | Zor | Düşük |
| ⚪ P4 | Placidus ev sistemi | Çok Zor | Yüksek |
| ⚪ P4 | Vertex hesabı | Zor | Düşük |
| ⚪ P4 | Hassas Dereceler tablosu | Orta | Düşük |

---

## 4. Şu An Doğru Çalışan Şeyler (Doğrulama Notları)

- Equal House sistemi 11 Kasım 1982, 06:27, Bursa için ASC Akrep 2°20' üretiyor ✓
- Retrograde: Saturn (Libra 27°) ve Pluto (Libra 27°) Retrograde değil bu tarihte — doğru
- Stellium: Güneş + Merkür + Venüs + Jüpiter Akrep'te → doğru tespiti yapılmalı ✓

---

## 5. UI Tab Yapısı — Mevcut vs Astro-Seek

| Bizim Tab | İçerik | Astro-Seek Karşılığı |
|-----------|--------|---------------------|
| Genel Bakış | Big Three, Element/Modal Denge, Dominant, Stellium, Retrograde, Wheel | Genel özet |
| Gezegenler | Tüm gezegenler detay | "Planets in Signs, Planets in Houses" |
| Evler | 12 ev + yönetici | "Interpretations - House rulers" |
| Açılar | Filtreli açı listesi + applying badge | "Planet aspects + Other aspects" |
| Harita Yorumu | Gemini yorumu (4 bölüm) + Transitler | Yok (ChatGPT export var) |

> **Not:** Eksik tab → "Özel Noktalar" (Lilith, Chiron, Node, Fortune) — ileriki sürümde.
