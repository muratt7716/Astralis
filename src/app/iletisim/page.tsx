"use client";
import Link from "next/link";
import { ArrowLeft, Mail, Clock, MessageCircle, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function IletisimPage() {
  const { t } = useTranslation();

  const topics = [
    t("legal.contact.topics.l1"),
    t("legal.contact.topics.l2"),
    t("legal.contact.topics.l3"),
    t("legal.contact.topics.l4"),
    t("legal.contact.topics.l5"),
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
          <span className="gradient-text">{t("legal.contact.title")}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">{t("legal.contact.last_updated")}</p>

        {/* Bize Ulaşın */}
        <div className="glass-card p-8 mb-6 border-l-4 border-l-purple-500 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <MessageCircle className="size-5 text-purple-400" />
            {t("legal.contact.s1.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.contact.s1.p1")}
          </p>
        </div>

        {/* E-posta */}
        <div className="glass-card p-8 mb-6 shadow-xl border border-purple-500/30 bg-purple-500/5">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="size-5 text-purple-400" />
            {t("legal.contact.email.title")}
          </h2>
          <a
            href="mailto:info@astralislab.com"
            className="inline-flex items-center gap-3 bg-white/5 border border-purple-500/30 rounded-2xl px-6 py-4 hover:border-purple-400/60 hover:bg-purple-500/10 transition-all group"
          >
            <Mail className="size-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-purple-300 group-hover:text-purple-200 font-semibold text-lg transition-colors">
              info@astralislab.com
            </span>
          </a>
        </div>

        {/* Yanıt Süresi */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="size-5 text-violet-400" />
            {t("legal.contact.response.title")}
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t("legal.contact.response.p1")}
          </p>
        </div>

        {/* Konular */}
        <div className="glass-card p-8 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="size-5 text-fuchsia-400" />
            {t("legal.contact.topics.title")}
          </h2>
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 text-sm"
              >
                <span className="size-1.5 rounded-full bg-purple-400 shrink-0" />
                {topic}
              </div>
            ))}
          </div>
        </div>

        {/* Bilgi Notu */}
        <div className="glass-card p-6 mb-6 shadow-xl border border-amber-500/20 bg-amber-500/5">
          <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
            <Info className="size-4" />
            {t("legal.contact.note.title")}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {t("legal.contact.note.p1")}
          </p>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/hakkimizda"
            className="text-gray-400 hover:text-white text-sm transition-colors underline underline-offset-4"
          >
            {t("legal.about.title")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
