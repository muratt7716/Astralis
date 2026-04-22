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

        {/* 1. Hizmetin Şartları */}
        <div className="glass-card p-8 mb-6 shadow-xl border-l-4 border-l-amber-500">
          <h2 className="text-xl font-bold text-white mb-3">1. Sözleşmenin Tarafları ve Niteliği</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            İşbu Kullanım Koşulları sözleşmesi, bir yanda Astralis Platformu ("Şirket") ile diğer yanda platforma herhangi bir arayüzden erişim sağlayan tüketici veya kullanıcı ("Kullanıcı") arasındaki yasal ticari ve dijital hizmet ilişkisini ihtiva eder. Platforma erişim sağlayarak veya üye olarak, tüm hukuki ve cezai yükümlülükleri eksiksiz olarak okuyup, idrak edip açıkça kabul ettiğinizi beyan edersiniz.
          </p>
        </div>

        {/* 2. Sorumluluk Reddi */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">2. Kesin İbra ve Sorumluluğun Sınırlandırılması Yeminli Beyanı</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Astralis üzerinde gerçekleştirilen astroloji, doğum haritası, Rün, I-Ching ve emsali tüm ezoterik analizlerin, bilimsel gerçekliği, mutlak kesinliği veya akademik geçerliliği <strong>iddia edilmemektedir.</strong> Uygulama, algoritmaların yorumlarına ve asırlık mitolojik sistemlere dayanan, <strong>sadece ve sadece EĞLENCE ve İÇGÖRÜ ("entertainment and introspection") amaçlı dijital bir servistir.</strong>
          </p>
          <ul className="space-y-2 text-gray-400 text-sm leading-relaxed list-disc list-inside mt-4 bg-white/5 p-4 rounded-xl">
            <li>Platform içeriklerinden elde edilen analizler asla psikolojik, tıbbi, mali (ör: yatırım danışmanlığı), adli veya hukuki profesyonel teşhis, tedavi veya yönlendirme niteliği/yerini almaz.</li>
            <li>Bu çıkarımlara dayanarak alınacak şahsi tüm fiili, mali, ticari ve manevi kararlardan tamamen ve salt Kullanıcı sorumludur.</li>
            <li>Astralis ve bağlı teknoloji ortakları, sağlanan yorumlar üzerinden doğabilecek doğrudan veya dolaylı maddi/manevi hiçbir zarardan yasal ve cezai mesuliyet kabul etmez; bu hususta Kullanıcı, Şirket'i tam ve kati surette ibra etmiştir.</li>
          </ul>
        </div>

        {/* 3. Dijital Abonelik */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">3. Premium Üyelik ve Cayma Hakkı İstisnası (Mesafeli Sözleşmeler Kapsamı)</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Ticaret Bakanlığı'na bağlı <span className="text-amber-400">Mesafeli Sözleşmeler Yönetmeliği Madde 15/(1)-(ğ)</span> bendi gereğince; "elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler" kapsamına giren dijital yazılım, kod ve anlık premium hesap aktivasyonu satışlarımızda <strong>CAYMA HAKKI KULLANILAMAZ</strong> ve ücret iadesi (refund) talep edilemez.
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>Kullanıcı abonelik işlemini teyit ettiği an ifa anında yerine getirilmiş kabul edilir ve cayma süresine ilişkin istisna yürürlüğe girer.</li>
            <li>Platform paket fiyatlarını, içerik erişim kotalarını veya abonelik türlerini önceden haber verilmeksizin piyasa koşullarına göre tek taraflı güncelleme hakkını saklı tutar.</li>
          </ul>
        </div>

        {/* 4. Fikri Mülkiyet */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">4. Sınai Haklar ve Fikri Mülkiyet Muhafazası</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Astralis arayüzü, logoları, "Liquid Glass" ve türevi özgün UX tasarımları, metinler, astrolojik algoritma matrisleri, sistem mantığı ve yayınlanan diğer tüm sanatsal/matematiksel veriler, 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile Markalar Kararnamesi dahil tüm uluslararası telif normlarınca koruma altındadır.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Platform içeriklerinin veri madenciliği (data mining), kaynak kodu tersine mühendisliği (reverse engineering), ya da sunuculara aşırı yük bindirecek yetkisiz script ve robot manipülasyonlarıyla alınması açık bir siber suç teşkil eder. Böylesi girişimlerde Kullanıcı hesabı sistemden kalıcı olarak bertaraf edilir ve derhal yasal yollara başvurulur.
          </p>
        </div>

        {/* 5. Yetkili Mahkeme */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">5. Yürürlük ve Uygulanacak Hukuk</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            İşbu 5 (beş) temel hükümden oluşan Kullanım Koşulları, elektronik vasıtalarla onaylandığı saniyede kesinleşerek yürürlüğe girer. Taraflar arası ihtilafların vuku bulması halinde, esasa Türk Hukuku uygulanacak olup; yargı mercii ve kesin icra dairesi olarak <strong>İstanbul Merkez Çağlayan Mahkemeleri</strong> yetkili kılınmıştır.
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
