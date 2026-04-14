"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import Logo from "./Cosmic/Logo";

export default function Footer() {
  const { t } = useTranslation();

  const firstHalf = ["koc", "boga", "ikizler", "yengec", "aslan", "basak"];
  const secondHalf = ["terazi", "akrep", "yay", "oglak", "kova", "balik"];

  return (
    <footer className="bg-[#050510] border-t border-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo size={40} />
              <span className="text-xl font-brand font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t("site.name")}
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Quick Links / Zodiac */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("nav.zodiac")}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
              {[...firstHalf, ...secondHalf].map((sign) => (
                <li key={sign}>
                  <Link href={`/burclar/${sign}`}
                    className="text-gray-500 hover:text-purple-400 text-sm transition-colors block">
                    {t(`zodiac.${sign}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-1">
            <h3 className="text-white font-brand font-semibold mb-4 text-sm uppercase tracking-wider">{t("site.name")} Araçları</h3>
            <ul className="space-y-2">
              <li><Link href="/yorumlar" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">{t("nav.horoscope")}</Link></li>
              <li><Link href="/numeroloji" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">Numeroloji</Link></li>
              <li><Link href="/hesaplayici" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">{t("nav.calculator")}</Link></li>
              <li><Link href="/dogum-haritasi" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">{t("nav.birthchart")}</Link></li>
              <li><Link href="/uyumluluk" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">{t("nav.compatibility")}</Link></li>
              <li><Link href="/burclar#gezegenler" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">{t("nav.planets")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 {t("site.name")}. {t("footer.rights")} ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
