'use client';

import React, { useState, useEffect } from 'react';
import NumerologyProfileCard from '@/components/numerology/NumerologyProfileCard';
import NameVibrations from '@/components/numerology/NameVibrations';
import CyclesDashboard from '@/components/numerology/CyclesDashboard';
import HolisticSynthesis from '@/components/numerology/HolisticSynthesis';
import { calculateNeuroMatrix } from '@/lib/numerology/advancedAlgorithms';
import { getPythagoreanCore } from '@/lib/numerology/pythagoras';
import { translations, SupportedLanguage } from '@/lib/i18n-shared';
import CosmicIcon from '@/components/Cosmic/CosmicIcon';
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useFreemiumQuota } from "@/lib/freemium";
import PremiumModal, { PremiumModalVariant } from "@/components/PremiumModal";
import FreemiumBadge from "@/components/FreemiumBadge";

export default function NumerologyPage() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [lang, setLang] = useState<SupportedLanguage>('tr');

  const { isPremium, isBlocked, isPremiumOnly, consumeQuota } = useFreemiumQuota("numeroloji");
  const [showPremium, setShowPremium] = useState(false);
  const [premiumVariant, setPremiumVariant] = useState<PremiumModalVariant>("premium_required");

  useEffect(() => {
    const match = document.cookie.match(/(^| )falci-lang=([^;]+)/);
    if (match) setLang(match[2] as SupportedLanguage);
  }, []);

  const t = (key: string) => translations[lang]?.[key] || translations['tr'][key] || key;

  const [coreNumbers, setCoreNumbers] = useState({
    lifePath: 0,
    expression: 0,
    soulUrge: 0,
    personality: 0,
    maturity: 0
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob) return;
    
    if (!isPremium) {
      if (isPremiumOnly) { setPremiumVariant("premium_required"); setShowPremium(true); return; }
      if (isBlocked) { setPremiumVariant("quota_exceeded"); setShowPremium(true); return; }
      consumeQuota();
    }

    const core = getPythagoreanCore(fullName, dob);
    setCoreNumbers(core);
    setIsCalculated(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName={t('num.hero.title')} variant={premiumVariant} />
      {/* Mystical Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <CosmicIcon name="numerology" size={80} className="mx-auto mb-6 animate-float" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 mb-4 pb-2">
            {t('num.hero.title')}
          </h1>
          <p className="text-lg text-purple-200/70 max-w-2xl mx-auto mb-4">
            {t('num.hero.sub')}
          </p>
          <FreemiumBadge toolKey="numeroloji" />
        </div>

        {!isCalculated ? (
          <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl p-5 sm:p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">{t('num.form.title')}</h2>
            <form onSubmit={handleCalculate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">{t('num.form.nameLabel')}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('num.form.namePlaceholder')}
                  className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">{t('num.form.dateLabel')}</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all outline-none"
                />
              </div>
              <div className="pt-2">
                <GlassButton
                  type="submit"
                  fullWidth
                  className="hover:border-purple-500/50"
                >
                  {t('num.form.submit')}
                </GlassButton>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setIsCalculated(false)}
                className="group text-sm px-6 py-2 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> 
                {t('num.form.new')}
              </button>
            </div>
            
            <NumerologyProfileCard data={coreNumbers} fullName={fullName} dob={dob} lang={lang} />
            <NameVibrations name={fullName} lang={lang} />
            <CyclesDashboard dobString={dob} lang={lang} />
            <HolisticSynthesis 
              fullName={fullName} 
              dob={dob} 
              coreNumbers={coreNumbers} 
              neuroMatrix={calculateNeuroMatrix(dob, fullName)} 
              lang={lang} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
