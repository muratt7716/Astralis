"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function MSSPage() {
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
          <span className="gradient-text">{t("legal.mss.title")}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">{t("legal.mss.last_updated")}</p>

        {/* 1. Taraflar */}
        <div className="glass-card p-8 mb-6 border-l-4 border-l-purple-500 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.mss.s1.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.mss.s1.p1")}
          </p>
        </div>

        {/* 2. Konu */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.mss.s2.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.mss.s2.p1")}
          </p>
        </div>

        {/* 3. Bedel */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.mss.s3.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.mss.s3.p1")}
          </p>
        </div>

        {/* 4. İfa */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">{t("legal.mss.s4.title")}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.mss.s4.p1")}
          </p>
        </div>

        {/* 5. Cayma */}
        <div className="glass-card p-8 mb-6 shadow-xl border border-amber-500/20 bg-amber-500/5">
          <h2 className="text-xl font-bold text-amber-500 mb-3 flex items-center gap-2">
            {t("legal.mss.s5.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.mss.s5.p1")}
          </p>
        </div>

        <div className="text-center mt-10 space-x-6">
          <Link href="/gizlilik" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            {t("auth.terms.privacy")}
          </Link>
          <Link href="/iptal-ve-iade" className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4">
            {t("legal.return.title")}
          </Link>
        </div>
      </div>
    </div>
  );
}
