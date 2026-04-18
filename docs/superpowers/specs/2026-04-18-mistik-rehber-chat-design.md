# Mistik Rehber Sohbet Sistemi — Tasarım Belgesi

**Tarih:** 2026-04-18
**Proje:** VoidSight / Falcı Bacı
**Konu:** Mistik Rehber ile canlı sohbet ekranı

---

## Özet

Kullanıcılar 5 mevcut karakterden birini seçip onunla sürekli, hafızalı, kişiselleşmiş bir sohbet deneyimi yaşayacak. Karakter kullanıcının kozmik profilini bilir, geçmiş konuşmaları özetler, kritik bilgileri kalıcı hafızaya alır ve zamanla ısınarak daha samimi konuşur. Özellik yalnızca premium kullanıcılara açık; ücretsiz kullanıcılar 5 mesajlık deneme alır.

---

## Karakterler

| ID | Lakap | Stil |
|----|-------|------|
| melisa | Mistik Melisa | Empatik, şefkatli, duygusal zeka |
| aras | Astrolog Aras | Rasyonel, net, stratejik |
| umut | Şaman Umut | Dürüst, esprili, samimi |
| hekate | Gizemli Hekate | Mistik, bilge, gözlemci |
| selin | Modern Selin | Analitik, detaycı, dakik |

Her karakterin orijinal lakabı `title` alanına geri yüklenecek. `mistik-rehber/page.tsx` ve `ProfileConstants` güncellencek.

---

## Kullanıcı Akışı

```
Profil Sayfası
  → "Rehberinle Konuş" butonu (ActiveGuideCard)
    → /mistik-rehber/chat/[guideId]
        → Tam ekran premium sohbet ekranı
```

Tüm kullanıcıların `selected_guide_id` onboarding'den geliyor (default: melisa). Ekstra yönlendirme mantığına gerek yok.

---

## Veritabanı

Schema'da aşağıdaki tablolar **zaten mevcut:**

- `conversations` — oturum kaydı, `context_summary` kolonu var
- `messages` — mesaj geçmişi
- `memories` — kalıcı öğrenilmiş bilgiler (karakter bazlı)

### Gerekli schema güncellemesi

`memories` tablosuna `guide_id` kolonu eklenmeli — hafıza karakter bazlı olacak:

```sql
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS guide_id TEXT;
```

`conversations` tablosuna mesaj sayısı özet tetikleyicisi için index:

```sql
CREATE INDEX IF NOT EXISTS idx_conversations_user_guide
ON public.conversations(user_id, guide_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON public.messages(conversation_id, created_at);
```

---

## Sistem Prompt Mimarisi (4 Katman)

Her API isteğinde aşağıdaki 4 katman sırayla birleştirilir:

### Katman 1 — Karakter Kimliği (sabit)

Her karakter için sabit prompt. Karakterin sesi, tarzı, yasak davranışları tanımlar. Asla bozulmaz.

Örnek — Şaman Umut:
> "Sen Şaman Umut'sun. Dürüst, biraz sert ama kırıcı olmayan bir dost. Espriyi kalkan olarak kullanırsın. Asla ağlama köşesi yapmazsın, çözüme odaklanırsın. Kullanıcı aynı konuyu tekrar tekrar açarsa hafifçe ve sevgiyle farkettir — karakterini kaybetmeden."

### Katman 2 — Kozmik Profil (her oturumda, profiles tablosundan)

```
Kullanıcı: [full_name]
Güneş Burcu: [sun_sign]
Yükselen: [rising_sign]
Ay Burcu: [moon_sign]
İlişki Durumu: [relationship_status]
Hayat Odağı: [life_focus] — Bu kısıtlayıcı değil, sadece kullanıcının önceliğini gösterir.
Kullanıcı her konuda soru sorabilir, odak sadece varsayılan lens'tir.
```

### Katman 3 — Öğrenilmiş Hafıza (karakter bazlı, memories tablosundan)

```
Bu kullanıcı hakkında öğrendiklerin:
- [fact] (kategori: [category], önem: [importance]/5)
- ...
Bunları doğal şekilde konuşmaya yansıt, robota dönme.
```

### Katman 4 — Isınma Seviyesi (benzersiz gün sayısına göre)

```sql
SELECT COUNT(DISTINCT DATE(created_at)) as days
FROM conversations
WHERE user_id = $1 AND guide_id = $2
```

| Benzersiz Gün | Seviye | Prompt Eklentisi |
|---------------|--------|-----------------|
| 1–2 | Yabancı | "Henüz tanışıyorsunuz. Nazik ve biraz mesafeli ol, kendini yavaş tanıt." |
| 3–6 | Tanışık | "Birkaç günlük dostlarsınız. Biraz daha serbest konuş, karakterine sadık kal." |
| 7+ | Dost | "Artık yakın dostlar gibi konuşabilirsiniz. Samimileş — ama özünü kaybetme." |

---

## Hibrit Hafıza Sistemi

### A — Anlık Hafıza Çıkarımı

Her Gemini yanıtı aşağıdaki yapıda döner (tek çağrı, iki çıktı):

```json
{
  "message": "Kullanıcıya verilen cevap metni",
  "memories_to_save": [
    {
      "category": "aşk",
      "fact": "Ahmet adında birine aşık, karşılık görmüyor",
      "importance": 4,
      "tags": ["Ahmet", "aşk", "red"]
    }
  ]
}
```

`memories_to_save` boş array olabilir. Varsa `memories` tablosuna `upsert` yapılır (`user_id + guide_id + fact` unique kontrolü).

### B — Konuşma Özeti (Uzun Vadeli Hafıza)

Her 20 mesajda bir tetiklenir. Özet kısa değil, **geniş ve detaylı JSON** olarak tutulur:

1. Son 20 mesaj Gemini'ye gönderilir
2. Şu prompt çalışır: "Bu konuşmayı detaylı özetle. Önemsiz görünen konular dahil her şeyi yaz. Geçen isimler, verilen kararlar, kullanıcının ruh hali, konuşulan olaylar, açık kalan sorular — hepsini koru."
3. Gemini aşağıdaki JSON formatında döner:

```json
{
  "topics": ["aşk", "iş stresi", "aile"],
  "key_people": ["Ahmet (sevgili adayı)", "Ayşe (iş arkadaşı)"],
  "decisions_made": ["Ahmet'e mesaj atmamaya karar verdi"],
  "open_questions": ["Terfi olacak mı?"],
  "mood": "kaygılı ama umutlu",
  "notable_events": ["İşte patronuyla tartıştı", "Annesiyle görüşmesi var"],
  "raw_summary": "Kullanıcı bu oturumda ağırlıklı olarak... (serbest metin)"
}
```

4. Bu JSON `conversations.context_summary`'e kaydedilir (JSONB olarak)
5. Bir sonraki oturumda bu özet sistema prompt'a eklenerek karakterin "hatırlıyor" hissini güçlendirir

### Her Yeni Mesajda Context Yapısı

```
[Sistem Prompt: 4 katman]
+ [context_summary: tüm geçmişin özeti]
+ [memories: kalıcı öğrenilmiş bilgiler]
+ [son 20 mesaj: güncel akış]
```

---

## API

### `POST /api/mistik-rehber/chat`

**Request:**
```json
{
  "guideId": "umut",
  "message": "Kullanıcı mesajı",
  "conversationId": "uuid | null"
}
```

**İşlem adımları:**
1. Auth kontrolü — user_id al
2. Premium kontrolü — değilse mesaj sayısını kontrol et (5 limit)
3. `conversationId` null ise yeni `conversations` kaydı oluştur
4. Distinct gün sayısını hesapla → ısınma seviyesi
5. `memories` çek (user_id + guide_id)
6. `profiles` çek (kozmik profil)
7. `conversations.context_summary` çek
8. Son 20 mesajı çek
9. 4 katman sistem prompt'u birleştir
10. Gemini'ye stream ile gönder
11. Yanıt tamamlanınca `memories_to_save` işle
12. Her 20 mesajda özet güncelle

**Response:** Server-Sent Events (streaming)

---

## Chat UI — `/mistik-rehber/chat/[guideId]`

### Layout

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  ← Geri   [Avatar] Şaman Umut   ···     │
│           "7 gündür konuşuyorsunuz"      │
│           Isınma seviyesi badge          │
├─────────────────────────────────────────┤
│                                         │
│  MESAJ ALANI                            │
│                                         │
│    [Rehber balonu]                      │
│                     [Kullanıcı balonu]  │
│    [Rehber yazıyor...]                  │
│                                         │
├─────────────────────────────────────────┤
│  [Mesaj yaz...        ] [→ Gönder]      │
│  (Ücretsiz: 3/5 mesaj kaldı)            │
└─────────────────────────────────────────┘
```

### Tasarım Detayları

- **Karakter rengi her yere yansır:** Header glow, rehber balonları, input border, ısınma badge rengi
- **Yazıyor animasyonu:** 3 nokta pulse — premium hissiyat
- **Mesaj balonları:** Rehber sola, kullanıcı sağa. Rehber balonunda karakter mini avatarı
- **Isınma badge:** "Yabancı / Tanışık / Dost" — header'da küçük bir badge
- **Premium duvarı:** 5 mesaj sonra blur overlay + "Premium'a geç" butonu (altyapı hazır, ileride aktif edilir)
- **Arka plan:** `mistik-rehber/page.tsx`'teki karakter glow animasyonuyla aynı tarz

### Navigasyon

- Header'daki geri butonu → `/profil`
- Sayfa ilk açıldığında mevcut `conversations` kaydı yükle, yoksa yeni başlat
- Özet güncelleme yalnızca API'de her 20 mesajda tetiklenir (mobilde `beforeunload` güvenilmez)

---

## Karakter Prompt Detayları

### Mistik Melisa
Empatiyle dinler, asla yargılamaz. Konuşma tekrar eden bir konuya döndüğünde yumuşakça "Görüyorum bu konu hâlâ kafanda" der. Isındıkça daha kişisel sorular sorar.

### Astrolog Aras
Mantık ve veriye dayanır. Duygusal olmaz ama soğuk da değil. Isındıkça "resmiyet perdesi kalkar" — hâlâ rasyonel ama artık espri de yapabilir. Asla duygusal biri olmaz.

### Şaman Umut
En hızlı ısınan karakter. Troll ama sevecen. Kullanıcı aynı konuya (örn. saplantılı aşk) tekrar dönünce hafifçe takılır: "Gene mi o konu, ben sana gitsin demedim mi?" Asla kırıcı olmaz.

### Gizemli Hekate
Mistik ve derin. Kısa cevap vermez, metaforlarla konuşur. Isındıkça mistik dilini korur ama daha az mesafeli olur. "Evrenin sana bir şey fısıldıyor" tarzı konuşur.

### Modern Selin
Analitik ve dakik. Astroloji verilerini ve sayıları sever. Isındıkça "hesap makinesi modundan" çıkar, biraz daha sıcak olur — ama hâlâ detaycıdır.

---

## Premium Altyapısı

Şu an üyelik sistemi yok. Yapı hazır olsun:

- `profiles` tablosuna `is_premium BOOLEAN DEFAULT false` eklenecek
- API'de kontrol: `is_premium = false` ise bu kullanıcının `messages` sayısını say
- 5 mesaj üstü → 402 response
- Frontend bunu yakalayıp blur overlay gösterecek

---

## Kapsam Dışı (Şimdilik)

- Ödeme/abonelik sistemi entegrasyonu
- RAG / pgvector vektör hafıza (C'ye geçiş)
- Push notification ("Rehberin seni bekliyor")
- Sesli mesaj
