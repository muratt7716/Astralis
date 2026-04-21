"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function KullanimKosullariPage() {
  return (
    <div className="cosmic-gradient min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" /> Ana Sayfa
        </Link>

        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Kullanım Koşulları</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">Son güncelleme: Nisan 2026</p>

        {/* 1. Hizmetin Kapsamı */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">1. Hizmetin Kapsamı</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Astralis, kullanıcılarına eğlence amaçlı astroloji, burç yorumları, Rünler, I Ching ve çeşitli ezoterik
            analiz hizmetleri sunan bir dijital platformdur.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Platformumuzda sunulan içerikler kehanet veya kesin öngörü niteliği taşımaz. Astralis, sunduğu yorumların
            bilimsel kanıta dayandığı iddiasında bulunmaz. Tüm içerikler yalnızca kişisel ilham ve eğlence amacıyla
            tasarlanmıştır.
          </p>
        </div>

        {/* 2. Kullanım Koşulları */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">2. Kullanım Kuralları</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Platforma erişerek aşağıdaki koşulları kabul etmiş sayılırsınız:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Platform 18 yaş ve üstü kullanıcılar için tasarlanmıştır.</li>
            <li>Hesabınızı başkalarıyla paylaşmanız yasaktır; her kullanıcı yalnızca bir hesap oluşturabilir.</li>
            <li>
              Hizmetin kötüye kullanımı (spam, bot trafiği, zararlı içerik yayma vb.) hesabınızın geçici veya kalıcı
              olarak askıya alınmasına neden olabilir.
            </li>
            <li>Platformu yalnızca yasal amaçlarla kullanmayı kabul edersiniz.</li>
            <li>Başka kullanıcıların deneyimini olumsuz etkileyecek davranışlardan kaçınmanız beklenir.</li>
          </ul>
        </div>

        {/* 3. Premium Abonelik */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">3. Premium Abonelik</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Astralis, ücretsiz ve premium olmak üzere iki kullanım planı sunmaktadır:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Ücretsiz planda günlük içerik ve seans limitleri geçerlidir.</li>
            <li>
              Premium abonelik, ek özellikler ve sınırsız erişim sağlar; otomatik yenileme içerebilir.
            </li>
            <li>
              Abonelik iptali, hesap ayarları sayfasından istediğiniz zaman gerçekleştirilebilir. İptal işlemi bir
              sonraki fatura döneminden itibaren geçerli olur.
            </li>
            <li>
              Astralis, abonelik ücretlerini önceden bildirerek değiştirme hakkını saklı tutar.
            </li>
          </ul>
        </div>

        {/* 4. Sorumluluk Sınırlaması */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">4. Sorumluluk Sınırlaması</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Astralis, platformda sunulan ezoterik analizlerin ve astroloji yorumlarının doğruluğunu, eksiksizliğini veya belirli bir
            amaca uygunluğunu garanti etmez.
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>
              Sunulan içerikler yatırım tavsiyesi, sağlık tavsiyesi veya hukuki danışmanlık niteliği taşımaz.
            </li>
            <li>
              Kullanıcının platformdaki içeriklere dayanarak aldığı kararlardan Astralis sorumlu tutulamaz.
            </li>
            <li>
              Teknik aksaklıklar, sunucu kesintileri veya veri kayıplarından doğabilecek dolaylı zararlar için
              Astralis&apos;in sorumluluğu sınırlıdır.
            </li>
          </ul>
        </div>

        {/* 5. Fikri Mülkiyet */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">5. Fikri Mülkiyet</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Platformda yer alan tüm içerikler, tasarımlar, görseller, yazılım kodları, metinler ve marka unsurları
            Astralis&apos;e aittir ve telif hukuku ile fikri mülkiyet mevzuatı kapsamında koruma altındadır.
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>
              Astralis&apos;in yazılı izni olmaksızın içeriklerin kopyalanması, çoğaltılması veya dağıtılması yasaktır.
            </li>
            <li>
              Platform üzerinde tersine mühendislik (reverse engineering) veya kaynak kodu çıkarma girişimleri
              yasaktır.
            </li>
          </ul>
        </div>

        {/* 6. Değişiklikler */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">6. Koşullardaki Değişiklikler</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Astralis, bu Kullanım Koşulları&apos;nı önceden haber vermeksizin güncelleme hakkını saklı tutar. Önemli
            değişiklikler e-posta veya platform bildirimleri aracılığıyla duyurulabilir. Değişikliklerin yayımlanmasından
            sonra platformu kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir. Bu sayfayı
            düzenli olarak kontrol etmenizi öneririz.
          </p>
        </div>

        {/* 7. Uygulanacak Hukuk */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">7. Uygulanacak Hukuk ve Yetki</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Bu Kullanım Koşulları, Türk Hukuku&apos;na tabidir. Koşulların uygulanmasından doğabilecek her türlü
            uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.
          </p>
        </div>

        {/* 8. İletişim */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">8. İletişim</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Bu Kullanım Koşulları hakkında sorularınız veya bildirimleriniz için:
          </p>
          <p className="mt-3 text-sm">
            <a href="mailto:destek@astralis.app" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              destek@astralis.app
            </a>
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/gizlilik" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            Gizlilik Politikası & KVKK&apos;yı görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
}
