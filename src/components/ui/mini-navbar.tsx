"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from "@/lib/i18n";
import Logo from "@/components/Cosmic/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-300';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-sm';

  return (
    <Link href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-500 ease-out transform group-hover:-translate-y-1/2">
        <span className={`${defaultTextColor} transition-colors`}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </Link>
  );
};

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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

  const navLinksData = [
    { label: t("nav.zodiac"), href: '/burclar' },
    { label: t("nav.horoscope"), href: '/yorumlar' },
    { label: t("nav.compatibility"), href: '/uyumluluk' },
    { label: t("nav.birthchart"), href: '/dogum-haritasi' },
    { label: t("nav.mistik_portal"), href: '#', isMistik: true },
  ];

  const toolLinks = [
    { href: "/biyoritim", label: t("nav.biyoritim"), icon: "🧬" },
    { href: "/ruya-analizi", label: t("nav.ruya_analizi"), icon: "🌙" },
    { href: "/iching", label: t("fortune.iching.title"), icon: "☯️" },
    { href: "/runler", label: t("fortune.runler.title"), icon: "ᚱ" },
    { href: "/kristal", label: t("fortune.kristal.title"), icon: "🔮" },
  ];

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       pl-6 pr-4 py-2 backdrop-blur-md
                       ${headerShapeClass}
                       border border-white/10 bg-black/40
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-all duration-500 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-10">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="hover:scale-110 transition-transform"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <Logo className="w-9 h-9 sm:w-11 sm:h-11 border-none bg-transparent" />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center space-x-6 text-sm">
          {navLinksData.map((link) => (
            link.isMistik ? (
              <div key="mistik-dropdown" className="relative group" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className="group relative h-5 overflow-hidden px-1 text-sm outline-none flex items-start"
                >
                  <div className={`flex flex-col transition-transform duration-500 ease-out transform ${toolsOpen ? '' : 'group-hover:-translate-y-1/2'}`}>
                    <div className="h-5 flex items-center gap-1 text-gray-300 whitespace-nowrap">
                      {link.label}
                      <svg className={`w-3 h-3 transition-all duration-300 ${toolsOpen ? "rotate-180 text-purple-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="h-5 flex items-center gap-1 text-white whitespace-nowrap">
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
                        <span className="text-base w-6 text-center">{item.icon}</span>
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

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu}>
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      <div className={`lg:hidden flex flex-col items-center w-full transition-all ease-in-out duration-500 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-6 pb-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-sm w-full">
          {navLinksData.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors w-full text-center tracking-widest uppercase font-light">
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-white/5 w-full">
            <p className="text-[10px] font-bold text-center text-purple-400 uppercase tracking-[0.3em] mb-4">
              {t("nav.mistik_portal")}
            </p>
            <div className="grid grid-cols-2 gap-2 px-4">
              {toolLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-400 hover:text-white transition-colors text-center"
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 w-full flex flex-col items-center">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
