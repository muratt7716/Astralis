"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import Logo from "./Cosmic/Logo";
import { 
  Mail, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { GlassButton } from "./ui/glass-button";

export default function Footer() {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Abonelik işlemi başarısız oldu");
      }

      setStatus('success');
      setEmail("");
      
      // 3 saniye sonra resetle
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || "Bir hata oluştu");
    }
  };

  const zodiacSigns = [
    "koc", "boga", "ikizler", "yengec", "aslan", "basak",
    "terazi", "akrep", "yay", "oglak", "kova", "balik"
  ];

  const socialLinks = [
    { 
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ), 
      label: "Instagram", 
      href: "https://instagram.com" 
    },
  ];

  const toolLinks = [
    { name: t("nav.horoscope"), href: "/yorumlar" },
    { name: t("nav.birthchart"), href: "/dogum-haritasi" },
    { name: t("nav.compatibility"), href: "/uyumluluk" },
    { name: t("nav.numeroloji"), href: "/numeroloji" },
    { name: t("nav.biyoritim"), href: "/biyoritim" },
    { name: t("nav.ruya_analizi"), href: "/ruya-analizi" },
  ];

  const supportLinks = [
    { name: "SSS", href: "#" },
    { name: "Kullanım Koşulları", href: "#" },
    { name: "Gizlilik Politikası", href: "#" },
    { name: "Destek", href: "#" },
  ];

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 pt-20 pb-10 bg-transparent backdrop-blur-sm">
      {/* Gradient Fade for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
      
      {/* Background Cosmic Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/30 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section - Glass Card */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-20 border border-white/10 bg-white/5 backdrop-blur-3xl group/footer-card">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-50 transition-opacity duration-700 group-hover/footer-card:opacity-80" />
          <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1 px-2 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("footer.newsletter_updates")}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif italic tracking-tighter">
                {t("footer.newsletter_title")}
              </h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
                {t("footer.newsletter_desc")}
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:bg-black/40 sm:p-1.5 sm:rounded-full sm:border sm:border-white/5 sm:shadow-2xl transition-all duration-300 focus-within:sm:border-cyan-500/30">
                <input
                  type="email"
                  required
                  value={email}
                  disabled={status === 'loading' || status === 'success'}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.newsletter_placeholder")}
                  className="w-full sm:flex-1 bg-black/40 sm:bg-transparent border border-white/10 sm:border-none rounded-2xl sm:rounded-full text-white placeholder-gray-500 px-6 py-4 focus:ring-0 focus:outline-none text-base disabled:opacity-50"
                />
                <GlassButton 
                  type="submit" 
                  size="lg" 
                  disabled={status === 'loading' || status === 'success'}
                  className="hover:border-cyan-500/50 w-full sm:w-auto relative"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                       <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                       Bekleniyor...
                    </span>
                  ) : status === 'success' ? (
                    <span className="text-green-400 flex items-center gap-2">
                       Abonelik Başarılı!
                    </span>
                  ) : (
                    t("footer.newsletter_button")
                  )}
                </GlassButton>
              </div>
              {status === 'error' && (
                <p className="text-red-400 text-sm ml-4 mt-1">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Logo size={46} />
              </div>
              <span className="text-2xl font-brand font-bold bg-gradient-to-r from-purple-400 via-white to-cyan-400 bg-clip-text text-transparent tracking-tighter">
                {t("site.name")}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              {t("footer.brand_desc")}
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
                >
                  <Icon className="size-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Zodiac Signs */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="size-3 text-purple-400" />
              {t("nav.zodiac")}
            </h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {zodiacSigns.map((sign) => (
                <li key={sign}>
                  <Link
                    href={`/burclar/${sign}`}
                    className="text-gray-500 hover:text-cyan-400 text-sm transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="size-0 group-hover:size-3 group-hover:mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                    {t(`zodiac.${sign}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tools */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="size-3 text-cyan-400" />
              {t("nav.araclar")}
            </h4>
            <ul className="space-y-4">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-cyan-400 text-sm transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="size-0 group-hover:size-3 group-hover:mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 text-xs font-light tracking-wide">
            © 2026 {t("site.name")} • {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-6 justify-center">
            <Link href="/gizlilik" className="text-gray-700 hover:text-gray-400 text-[10px] uppercase tracking-widest font-bold transition-colors">{t("footer.privacy")}</Link>
            <Link href="/kullanim-kosullari" className="text-gray-700 hover:text-gray-400 text-[10px] uppercase tracking-widest font-bold transition-colors">{t("footer.terms")}</Link>
            <span className="text-gray-700 text-[10px] uppercase tracking-widest font-bold">{t("footer.cosmic_guide")}</span>
            <span className="text-gray-700 text-[10px] uppercase tracking-widest font-bold">{t("footer.stay_peaceful")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
