"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Cosmic/Logo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const mainLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/burclar", label: t("nav.zodiac") },
    { href: "/yorumlar", label: t("nav.horoscope") },
    { href: "/uyumluluk", label: t("nav.compatibility") },
    { href: "/dogum-haritasi", label: t("nav.birthchart") },
    { href: "/numeroloji", label: t("nav.numeroloji") },
  ];

  const toolLinks = [
    { href: "/biyoritim", label: t("nav.biyoritim"), icon: "🧬" },
    { href: "/ruya-analizi", label: t("nav.ruya_analizi"), icon: "🌙" },
    { href: "/fallar/iching", label: t("fortune.iching.title"), icon: "☯️" },
    { href: "/fallar/runler", label: t("fortune.runler.title"), icon: "ᚱ" },
    { href: "/fallar/kristal", label: t("fortune.kristal.title"), icon: "🔮" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070714]/80 backdrop-blur-xl border-b border-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-brand font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("site.name")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1"
              >
                {t("nav.mistik_portal")} ✨
                <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-[#0d0d24]/95 backdrop-blur-xl border border-purple-500/15 shadow-2xl shadow-purple-900/20 overflow-hidden">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base w-6 text-center">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Language Switcher + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-400 focus:text-white active:text-white transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#070714]/95 backdrop-blur-xl border-b border-purple-500/10">
          <div className="px-4 py-3 space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            {/* Tools Section in Mobile */}
            <div className="pt-2 mt-2 border-t border-white/5">
              <p className="px-3 py-1 text-xs font-bold text-purple-400 uppercase tracking-wider">✨ {t("nav.mistik_portal")}</p>
              {toolLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <span className="text-base w-5 text-center">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
