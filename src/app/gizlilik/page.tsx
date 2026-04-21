"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GizlilikPage() {
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
          <span className="gradient-text">Gizlilik Politikası & KVKK</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">Son güncelleme: Nisan 2026</p>

        {/* 1. Veri Sorumlusu */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">1. Veri Sorumlusu</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatını taşıyan işletme
            aşağıda belirtilmiştir:
          </p>
          <ul className="mt-3 space-y-1 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold text-white">İşletme adı:</span> Astralis
            </li>
            <li>
              <span className="font-semibold text-white">Platform:</span> astralis.app
            </li>
            <li>
              <span className="font-semibold text-white">İletişim:</span>{" "}
              <a href="mailto:destek@astralis.app" className="text-purple-400 hover:text-purple-300 transition-colors">
                destek@astralis.app
              </a>
            </li>
          </ul>
        </div>

        {/* 2. Toplanan Veriler */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">2. Toplanan Kişisel Veriler</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Hizmetlerimizi sunabilmek amacıyla aşağıdaki kişisel veriler işlenmektedir:
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Kimlik Bilgileri</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Ad, doğum tarihi, doğum yeri, doğum saati — astroloji ve analitik hesaplamaların temelini oluşturur.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">İletişim Bilgileri</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                E-posta adresi — hesap oluşturma, kimlik doğrulama ve bildirimler için kullanılır.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Kullanım Verileri</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Uygulama içi etkileşimler, tercihler, görüntülenen içerikler — hizmet kalitesini artırmak amacıyla
                işlenir.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Teknik Veriler</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                IP adresi, cihaz türü, tarayıcı bilgisi — Vercel ve Supabase altyapısı tarafından otomatik olarak
                toplanır.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Ezoterik Yorum Verileri</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kullanıcının gerçekleştirdiği seanslar ve analizler (interaction_logs tablosunda saklanır).
              </p>
            </div>
          </div>
        </div>

        {/* 3. Verilerin İşlenme Amacı */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">3. Verilerin İşlenme Amacı</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Kişisel verileriniz aşağıdaki amaçlar doğrultusunda KVKK&apos;nın 5. maddesi kapsamında işlenmektedir:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Kişiselleştirilmiş astroloji ve ezoterik analiz hizmetlerinin sunulması</li>
            <li>Hesap oluşturma ve kimlik doğrulamanın sağlanması (Supabase Auth)</li>
            <li>Hizmet kalitesinin iyileştirilmesi ve kullanıcı deneyiminin geliştirilmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Güvenlik önlemlerinin alınması ve sahteciliğin önlenmesi</li>
          </ul>
        </div>

        {/* 4. Verilerin Saklanması */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">4. Verilerin Saklanması ve Güvenliği</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Kişisel verileriniz, Supabase altyapısında AB (Avrupa Birliği) bölgesi sunucularında şifreli biçimde
            saklanmaktadır. Supabase, SOC 2 Type II sertifikalı ve GDPR uyumlu bir veri işleme hizmetidir.
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Veriler yalnızca hizmet sunumu için gerekli olduğu süre boyunca saklanır.</li>
            <li>Hesabınızı silmeniz halinde verileriniz 30 gün içinde imha edilir.</li>
            <li>Teknik veriler (log dosyaları) en fazla 90 gün süreyle tutulur.</li>
          </ul>
        </div>

        {/* 5. Kullanıcı Hakları */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">5. Kullanıcı Hakları (KVKK Madde 11)</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            KVKK&apos;nın 11. maddesi uyarınca kişisel verilerinize ilişkin aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme hakkı</li>
            <li>İşlenen verilerinize erişim hakkı</li>
            <li>Yanlış veya eksik verilerin düzeltilmesini talep etme hakkı</li>
            <li>Kişisel verilerinizin silinmesini talep etme hakkı</li>
            <li>İşlemenin kısıtlanmasını talep etme hakkı</li>
            <li>Verilerinizin üçüncü taraflara aktarılmasına itiraz etme hakkı</li>
            <li>Otomatik karar alma süreçlerine itiraz etme hakkı</li>
          </ul>
          <p className="text-gray-300 text-sm leading-relaxed mt-4">
            Bu haklarınızı kullanmak için{" "}
            <a href="mailto:destek@astralis.app" className="text-purple-400 hover:text-purple-300 transition-colors">
              destek@astralis.app
            </a>{" "}
            adresine e-posta gönderebilirsiniz. Talepleriniz 30 gün içinde yanıtlanır.
          </p>
        </div>

        {/* 6. Üçüncü Taraf Hizmetler */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">6. Üçüncü Taraf Hizmetler</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Hizmetlerimizi sunabilmek için aşağıdaki üçüncü taraf sağlayıcılarla çalışmaktayız. Her biri kendi gizlilik
            politikasına tabidir:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold text-sm mb-1">Analitik İşlem Sağlayıcıları</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Astroloji ve ezoterik analizlerin üretilmesi için güvenli bulut tabanlı API servisleri kullanılır. İlgili firmalarla veri işleme anlaşması (DPA)
                mevcuttur; gönderilen veriler yalnızca yanıt üretimi için kullanılır ve sistemleri eğitmek amacıyla saklanmaz.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold text-sm mb-1">Supabase</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kimlik doğrulama ve veritabanı altyapısı olarak kullanılır. GDPR uyumlu, AB bölgesi sunucuları.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold text-sm mb-1">Vercel</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Uygulamamızın barındırıldığı (hosting) altyapıdır. Erişim logları Vercel tarafından tutulabilir.
              </p>
            </div>
          </div>
        </div>

        {/* 7. Çerezler */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">7. Çerezler (Cookies)</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Platformumuz aşağıdaki çerez türlerini kullanmaktadır:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold text-white">Oturum çerezi (Zorunlu):</span> Giriş durumunuzu koruyan,
              hizmetin çalışması için gerekli çerez.
            </li>
            <li>
              <span className="font-semibold text-white">Dil tercihi çerezi (Fonksiyonel):</span> Seçtiğiniz dili
              hatırlamak için kullanılır.
            </li>
            <li>
              <span className="font-semibold text-white">Analitik çerezler (İsteğe bağlı):</span> Platformun nasıl
              kullanıldığını anlamak amacıyla, yalnızca onayınızla etkinleştirilir.
            </li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
          </p>
        </div>

        {/* 8. Güncellemeler */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">8. Politika Güncellemeleri</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Bu Gizlilik Politikası ve KVKK Aydınlatma Metni zaman zaman güncellenebilir. Önemli değişiklikler e-posta
            ile bildirilir. Değişikliklerin yürürlüğe girdiği tarihten sonra platformu kullanmaya devam etmeniz,
            güncel politikayı kabul ettiğiniz anlamına gelir. Bu sayfanın en üstündeki &quot;Son güncelleme&quot;
            tarihini düzenli olarak kontrol etmenizi öneririz.
          </p>
        </div>

        {/* 9. İletişim */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">9. İletişim</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Bu politikayla ilgili sorularınız, kişisel veri talepleriniz veya şikayetleriniz için:
          </p>
          <p className="mt-3 text-sm">
            <a href="mailto:destek@astralis.app" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              destek@astralis.app
            </a>
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Talepleriniz en geç 30 gün içinde yanıtlanacaktır. KVKK kapsamındaki başvurularınızı ayrıca{" "}
            <a
              href="https://www.kvkk.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Kişisel Verileri Koruma Kurumu (KVKK)
            </a>{" "}
            aracılığıyla da iletebilirsiniz.
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/kullanim-kosullari" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            Kullanım Koşulları&apos;nı görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
}
