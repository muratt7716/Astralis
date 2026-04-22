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
        <div className="glass-card p-8 mb-6 border-l-4 border-l-purple-500 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">1. Veri Sorumlusu ve Amacımız</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili alt mevzuat kapsamında, Astralis (&quot;Veri Sorumlusu&quot; veya &quot;Şirket&quot;) olarak kişisel verilerinizin hukuka uygun olarak işlenmesine, korunmasına ve veri minimizasyonu ilkesine azami özeni göstermekteyiz.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Bu aydınlatma metni, sunduğumuz dijital astroloji ve ezoterik analiz hizmetleri kapsamında hangi verilerinizi, hangi daraltılmış amaçlarla işlediğimizi şeffaf bir biçimde ortaya koymak amacıyla hazırlanmıştır.
          </p>
        </div>

        {/* 2. Toplanan Veriler */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">2. İşlenen Kişisel Veriler ve Veri Minimizasyonu</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Astralis, <strong>&quot;Veri Minimizasyonu&quot; (gerektiği kadar veri işleme)</strong> evrensel hukuk prensibini esas alır. Kullanıcılarımızdan asla gerçek ad-soyad, T.C. kimlik numarası, açık adres veya finansal kimlik doğrulayıcı veriler talep edilmez ve arşivlenmez. Yalnızca aşağıdaki asgari veriler işlenmektedir:
          </p>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-purple-300 font-bold text-sm mb-1">Astrolojik Çekirdek Veriler (Sözde Anonim)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Kullanıcı adı (rumuz), doğum tarihi, doğum yeri (şehir düzeyinde) ve doğum saati. Bu veriler yalnızca astronomik hesaplamalar ve göksel konumlandırmaların matematiksel formülasyonu için teknik altyapımıza anlık olarak iletilir.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-purple-300 font-bold text-sm mb-1">Dijital Ayak İzi ve İletişim Verileri</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hesap güvenliği ve kimlik doğrulama süreçleri için yalnızca E-posta adresi (Google vb. kimlik doğrulayıcılarla entegre) ve genel analitik veri amacı taşıyan standart tarayıcı giriş (log) bilgileri işlenmektedir.
              </p>
            </div>
          </div>
        </div>

        {/* 3. KVKK M.9Yurtdışı Aktarım */}
        <div className="glass-card p-8 mb-6 shadow-xl border border-amber-500/20 bg-amber-500/5">
          <h2 className="text-xl font-bold text-amber-500 mb-3 flex items-center gap-2">
            3. Yurt Dışı Aktarım Çerçevesi (KVKK Madde 9 uyumluluğu)
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Astralis, kesintisiz hizmet sunabilmek ve üst düzey uçtan uca şifreleme metotları kullanabilmek amacıyla küresel ölçekte akredite edilmiş, standart izolasyonlu bulut altyapısı ve yetkilendirme sağlayıcıları kullanmaktadır. 
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mt-2 font-medium">
            Platforma üye olarak ve hizmetlerimizi kullanarak; temel kimlik doğrulama işlemleri ve astrolojik çekirdek verilerinizin, yüksek güvenlik protokolleriyle korunan yurt dışı merkezli sunucularda barındırıldığını kabul eder ve bu verilerin KVKK Madde 9 uyarınca yurt dışına aktarılmasına şeffaf biçimde <strong>açık rıza göstermiş sayılırsınız.</strong>
          </p>
        </div>

        {/* 4. İşleme Amacı ve Hukuki Sebep */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">4. İşlenme ve Saklama Şartları</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Kişisel verileriniz, <strong>KVKK Madde 5/2-c (Sözleşmenin ifası)</strong> ve <strong>Madde 5/2-f (Veri sorumlusunun meşru menfaati)</strong> hukuki sebeplerine dayalı olarak dijital deneyimin oluşturulması, hesabın şifrelenmesi ve ödeme altyapılarının güvenliği amacıyla işlenir.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Yapay zeka modellerimiz verilerinizi "öğrenme setleri" içerisine kopyalamaz; istatistiksel işlemler sadece anlık gerçekleşerek size özel raporu oluşturur. Hizmetimizi sonlandırıp üyeliğinizi sildiğinizde, yasal log zorunlulukları saklı kalmak kaydıyla şahsi eşleştirmeli astrolojik profil verileriniz veritabanlarımızdan kalıcı olarak anonimleştirilir veya yok edilir.
          </p>
        </div>

        {/* 5. Kullanıcı Hakları */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">5. KVKK Madde 11 Kapsamında Haklarınız</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Astralis Kullanıcısı olarak; verilerinizin işlenip işlenmediğini öğrenme, işlenen verilerinizin amacına uygun kullanılıp kullanılmadığını anlama, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış verilerin düzeltilmesini ve silinmesini/yok edilmesini (KVKK Madde 7) talep etme hakkına daima sahipsiniz.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mt-4">
            Veri sorumlusuna yasal başvurularınızı bildirmek için resmi kanallarımız üzerinden{" "}
            <a href="mailto:destek@astralis.app" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold underline underline-offset-2">
              destek@astralis.app
            </a>{" "}
            adresine elektronik posta gönderebilirsiniz. Başvurunuz, hukuki süreler olan 30 (otuz) gün içerisinde sonuçlandırılarak tarafınıza yazılı bildirim yapılacaktır.
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
