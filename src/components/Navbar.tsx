"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Cosmic/Logo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/burclar", label: t("nav.zodiac") },
    { href: "/yorumlar", label: t("nav.horoscope") },
    { href: "/fallar", label: t("nav.fallar") },
    { href: "/hesaplayici", label: t("nav.calculator") },
    { href: "/dogum-haritasi", label: t("nav.birthchart") },
    { href: "/uyumluluk", label: t("nav.compatibility") },
    { href: "/gezegenler", label: t("nav.planets") },
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
