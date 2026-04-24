"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation, languages } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-helpers";
import { logInteraction, getActionByPath } from "@/lib/logging";
import Logo from "@/components/Cosmic/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { User, LogOut, Crown, LayoutDashboard } from "lucide-react";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-300';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-xs lg:text-[13px] xl:text-[15px] font-medium tracking-wide';

  return (
    <Link href={href} className={`group relative inline-flex overflow-hidden h-6 items-start shrink-0 ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-500 ease-out transform group-hover:-translate-y-1/2">
        <span className={`h-6 flex items-center ${defaultTextColor} transition-colors whitespace-nowrap`}>{children}</span>
        <span className={`h-6 flex items-center ${hoverTextColor} whitespace-nowrap`}>{children}</span>
      </div>
    </Link>
  );
};

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const [isNavHidden, setIsNavHidden] = useState(false);
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Handle automatic interaction logging and Navbar visibility logic
  useEffect(() => {
    // Automatic visit logging disabled — tools log their own results
    // when the user actually performs an action (e.g. birth chart calculation).

    // 2. Navbar Visibility (Check for hide-nav class on root)
    const observer = new MutationObserver(() => {
      setIsNavHidden(document.documentElement.classList.contains('hide-nav'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsNavHidden(document.documentElement.classList.contains('hide-nav'));

    return () => observer.disconnect();
  }, [pathname, user]);

  const navLinksData = [
    { label: t("nav.zodiac"), href: '/burclar' },
    { label: t("nav.horoscope"), href: '/yorumlar' },
    { label: t("nav.compatibility"), href: '/uyumluluk' },
    { label: t("nav.birthchart"), href: '/dogum-haritasi' },
    { label: t("nav.mistik_portal"), href: '#', isMistik: true },
  ];

  const toolLinks = [
    { href: "/horary", label: t("nav.horary"), name: "horary" },
    { href: "/biyoritim", label: t("nav.biyoritim"), name: "biorhythm" },
    { href: "/ruya-analizi", label: t("nav.ruya_analizi"), name: "dream" },
    { href: "/numeroloji", label: t("nav.numeroloji"), name: "numerology" },
    { href: "/iching", label: t("fortune.iching.title"), name: "iching" },
    { href: "/runler", label: t("fortune.runler.title"), name: "runler" },
    { href: "/kristal", label: t("fortune.kristal.title"), name: "kristal" },
  ];

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       pl-4 pr-3 py-2 xl:pl-6 xl:pr-4 backdrop-blur-md
                       ${headerShapeClass}
                       border border-white/10 bg-black/40
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-all duration-500 ease-in-out
                       ${isNavHidden ? 'opacity-0 pointer-events-none -translate-y-20' : 'opacity-100'}`}>

      <div className="flex items-center justify-between w-full gap-x-4 sm:gap-x-6 lg:gap-x-6 xl:gap-x-12 shrink-0">
        <div className="flex items-center">
          <Link href="/" className="hover:scale-110 transition-transform">
            <Logo className="w-9 h-9 sm:w-11 sm:h-11 border-none bg-transparent" />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center space-x-4 lg:space-x-5 xl:space-x-8 shrink-0">
          {navLinksData.map((link) => (
            link.isMistik ? (
              <div key="mistik-dropdown" className="relative group shrink-0" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className="group relative h-6 overflow-hidden px-1 text-xs lg:text-[13px] xl:text-[15px] tracking-wide font-medium outline-none flex items-start shrink-0"
                >
                  <div className={`flex flex-col transition-transform duration-500 ease-out transform ${toolsOpen ? '' : 'group-hover:-translate-y-1/2'}`}>
                    <div className="h-6 flex items-center gap-1 text-gray-300 whitespace-nowrap">
                      {link.label}
                      <svg className={`w-3 h-3 transition-all duration-300 ${toolsOpen ? "rotate-180 text-purple-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="h-6 flex items-center gap-1 text-white whitespace-nowrap">
                      {link.label}
                      <svg className={`w-3 h-3 transition-all duration-300 ${toolsOpen ? "rotate-180 text-purple-400" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                {toolsOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top">
                    {toolLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <CosmicIcon name={item.name as any} size={24} className="shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <AnimatedNavLink key={link.href} href={link.href}>
                {link.label}
              </AnimatedNavLink>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 min-w-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Premium badge — sadece premium olmayanlara, desktop */}
          {user && !profile?.is_premium && (
            <Link
              href="/premium"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-gradient-to-r from-purple-600/20 to-amber-500/20
                border border-purple-500/30 text-purple-300 text-xs
                hover:border-purple-500/60 hover:text-purple-200
                transition-all duration-200 font-medium"
              aria-label="Premium üyeliğe geç"
            >
              <Crown className="w-3 h-3" />
              Premium
            </Link>
          )}

          {/* Auth Button */}
          {!authLoading && (
            user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center justify-center gap-2 
             px-2 py-1.5 
             rounded-full hover:bg-white/10 transition-all 
             group max-w-[140px] xl:max-w-[180px]"
                >
                  {/* Avatar */}
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover 
                 ring-2 ring-purple-500/40 
                 group-hover:ring-purple-500/70 
                 transition-all shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 
                    flex items-center justify-center 
                    ring-2 ring-purple-500/40 shrink-0">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}

                  {/* Name */}
                  <span
                    className="
      hidden sm:block
      text-[12px] xl:text-[13px]
      text-gray-300 group-hover:text-white 
      transition-colors font-medium
      truncate
      max-w-[70px] xl:max-w-[100px]
    "
                  >
                    {profile?.full_name?.split(' ')[0] || t("nav.user.placeholder")}
                  </span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
                    <Link
                      href="/profil"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" /> {t("nav.user.profile")}
                    </Link>
                    <Link
                      href="/mistik-rehber"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <CosmicIcon name="dream" size={16} className="shrink-0" /> {t("nav.user.mistik_guide")}
                    </Link>
                    {/* Admin Panel Shortcut */}
                    {user && (user.email === 'ismailmertbal@gmail.com' || user.email === 'mmuratb77@gmail.com') && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> {t("nav.user.admin")}
                      </Link>
                    )}
                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await signOut();
                        router.push('/');
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" /> {t("nav.user.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/onboarding"
                className="hidden sm:flex items-center gap-2 px-4 py-2 xl:px-5 xl:py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs lg:text-[13px] font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] whitespace-nowrap"
              >
                {t("nav.user.login")}
              </Link>
            )
          )}

          <button className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu}>
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      <div className={`lg:hidden flex flex-col items-center w-full transition-all ease-in-out duration-500 overflow-y-auto
                       ${isOpen ? 'max-h-[calc(100svh-100px)] opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-sm w-full">
          {navLinksData
            .filter(link => !link.isMistik) // Mobile already has a grid for Mistik Portal tools
            .map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors w-full text-center tracking-widest uppercase font-light">
                {link.label}
              </Link>
            ))}

          <div className="pt-4 border-t border-white/5 w-full">
            <p className="text-[10px] font-bold text-center text-purple-400 uppercase tracking-[0.3em] mb-4">
              {t("nav.mistik_portal")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4">
              {toolLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-400 hover:text-white transition-colors text-center"
                >
                  <CosmicIcon name={link.name as any} size={32} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${language === lang.code ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' : 'border-white/10 bg-white/5 text-gray-400'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
            {!authLoading && (
              user ? (
                <div className="flex flex-col items-center gap-2 w-full px-4">
                  <Link href="/profil" onClick={() => setIsOpen(false)} className="w-full text-center py-3 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
                    {t("nav.user.profile")}
                  </Link>
                  {/* Admin Panel Shortcut Mobile */}
                  {user && (user.email === 'ismailmertbal@gmail.com' || user.email === 'mmuratb77@gmail.com') && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="w-full text-center py-3 rounded-xl bg-purple-500/10 border border-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest">
                      {t("nav.user.admin")}
                    </Link>
                  )}
                  <button
                    onClick={async () => { setIsOpen(false); await signOut(); router.push('/'); }}
                    className="w-full text-center py-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest"
                  >
                    {t("nav.user.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full px-4">
                  <Link href="/onboarding" onClick={() => setIsOpen(false)} className="w-full block text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest">
                    {t("nav.user.login")}
                  </Link>
                </div>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
