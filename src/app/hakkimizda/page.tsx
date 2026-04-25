"use client";
import Link from "next/link";
import { ArrowLeft, Sparkles, Target, Layers, Mail } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function HakkimizdaPage() {
  const { t } = useTranslation();

  const tools = [
    t("legal.about.s3.l1"),
    t("legal.about.s3.l2"),
    t("legal.about.s3.l3"),
    t("legal.about.s3.l4"),
    t("legal.about.s3.l5"),
    t("legal.about.s3.l6"),
    t("legal.about.s3.l7"),
    t("legal.about.s3.l8"),
  ];

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
          <span className="gradient-text">{t("legal.about.title")}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">{t("legal.about.last_updated")}</p>

        {/* 1. Biz Kimiz */}
        <div className="glass-card p-8 mb-6 border-l-4 border-l-purple-500 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="size-5 text-purple-400" />
            {t("legal.about.s1.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.about.s1.p1")}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed italic">
            {t("legal.about.s1.p2")}
          </p>
        </div>

        {/* 2. Misyon */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Target className="size-5 text-violet-400" />
            {t("legal.about.s2.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.about.s2.p1")}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t("legal.about.s2.p2")}
          </p>
        </div>

        {/* 3. Araçlar */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="size-5 text-fuchsia-400" />
            {t("legal.about.s3.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {t("legal.about.s3.p1")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm leading-relaxed flex items-start gap-2"
              >
                <span className="text-purple-400 mt-0.5 shrink-0">✦</span>
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* 4. İletişim */}
        <div className="glass-card p-8 mb-6 shadow-xl border border-purple-500/20 bg-purple-500/5">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Mail className="size-5 text-purple-400" />
            {t("legal.about.s4.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {t("legal.about.s4.p1")}
          </p>
          <a
            href="mailto:info@astralislab.com"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-semibold text-base underline underline-offset-4"
          >
            info@astralislab.com
          </a>
          <p className="text-gray-500 text-xs mt-3">{t("legal.about.s4.p2")}</p>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/iletisim"
            className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4"
          >
            {t("legal.contact.title")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
