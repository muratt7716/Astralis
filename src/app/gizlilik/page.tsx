"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function GizlilikPage() {
  const { t } = useTranslation();
  return (
    <div className="cosmic-gradient min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="size-4" /> {t("legal.home")}
        </Link>

        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">{t("legal.privacy.title")}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">{t("legal.privacy.last_updated")}</p>

        {/* 1. Veri Sorumlusu */}
        <div className="glass-card p-8 mb-6 border-l-4 border-l-purple-500 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacy.s1.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            {t("legal.privacy.s1.p1")}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.privacy.s1.p2")}
          </p>
        </div>

        {/* 2. Toplanan Veriler */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">{t("legal.privacy.s2.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {t("legal.privacy.s2.p1")}
          </p>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-purple-300 font-bold text-sm mb-1">{t("legal.privacy.s2.h1")}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t("legal.privacy.s2.p2")}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="text-purple-300 font-bold text-sm mb-1">{t("legal.privacy.s2.h2")}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t("legal.privacy.s2.p3")}
              </p>
            </div>
          </div>
        </div>

        {/* 3. KVKK M.9Yurtdışı Aktarım */}
        <div className="glass-card p-8 mb-6 shadow-xl border border-amber-500/20 bg-amber-500/5">
          <h2 className="text-xl font-bold text-amber-500 mb-3 flex items-center gap-2">
            {t("legal.privacy.s3.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.privacy.s3.p1")}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mt-2 font-medium">
            {t("legal.privacy.s3.p2")}
          </p>
        </div>

        {/* 4. İşleme Amacı ve Hukuki Sebep */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacy.s4.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.privacy.s4.p1")}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.privacy.s4.p2")}
          </p>
        </div>

        {/* 5. Kullanıcı Hakları */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacy.s5.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {t("legal.privacy.s5.p1")}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed mt-4">
            {t("legal.privacy.s5.p2")}{" "}
            <a href="mailto:info@astralislab.com" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold underline underline-offset-2">
              info@astralislab.com
            </a>{" "}
            {t("legal.privacy.s5.p3")}
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/kullanim-kosullari" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            {t("legal.privacy.terms_link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
