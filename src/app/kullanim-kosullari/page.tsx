"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function KullanimKosullariPage() {
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
          <span className="gradient-text">{t("legal.terms.title")}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">{t("legal.terms.last_updated")}</p>

        {/* 1. Hizmetin Şartları */}
        <div className="glass-card p-8 mb-6 shadow-xl border-l-4 border-l-amber-500">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.terms.s1.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.terms.s1.p1")}
          </p>
        </div>

        {/* 2. Sorumluluk Reddi */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.terms.s2.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.terms.s2.p1")}
          </p>
          <ul className="space-y-2 text-gray-400 text-sm leading-relaxed list-disc list-inside mt-4 bg-white/5 p-4 rounded-xl">
            <li>{t("legal.terms.s2.l1")}</li>
            <li>{t("legal.terms.s2.l2")}</li>
            <li>{t("legal.terms.s2.l3")}</li>
          </ul>
        </div>

        {/* 3. Dijital Abonelik */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.terms.s3.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.terms.s3.p1")}
          </p>
          <ul className="space-y-2 text-gray-300 text-sm leading-relaxed list-disc list-inside">
            <li>{t("legal.terms.s3.l1")}</li>
            <li>{t("legal.terms.s3.l2")}</li>
          </ul>
        </div>

        {/* 4. Fikri Mülkiyet */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.terms.s4.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.terms.s4.p1")}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.terms.s4.p2")}
          </p>
        </div>

        {/* 5. Yetkili Mahkeme */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.terms.s5.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.terms.s5.p1")}
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/gizlilik" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            {t("legal.terms.privacy_link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
