'use client';

import React, { useState } from 'react';
import { getPythagoreanMeaning, getFrequencyExplanations } from '@/data/numerology/meanings';
import { calculateCosmicResonance, calculateNeuroMatrix } from '@/lib/numerology/advancedAlgorithms';
import { translations, SupportedLanguage } from '@/lib/i18n-shared';

type CoreNumbersProps = {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
};

type CardProps = {
  data: CoreNumbersProps;
  fullName: string;
  dob: string;
  lang: SupportedLanguage;
};

export default function NumerologyProfileCard({ data, fullName, dob, lang }: CardProps) {
  const [activeTab, setActiveTab] = useState<'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'maturity'>('lifePath');
  const t = (key: string) => translations[lang]?.[key] || translations['tr'][key] || key;

  // Math algorithms
  const neuroMatrix = calculateNeuroMatrix(dob, fullName);
  const cosmicResonance = calculateCosmicResonance(data.lifePath, data.expression, new Date().getFullYear());
  const freqExplanations = getFrequencyExplanations(lang);

  const getMeaningObj = (num: number) => {
    return getPythagoreanMeaning(num, lang) || getPythagoreanMeaning(String(num).split('').reduce((a,b)=>a+parseInt(b),0), lang) || getPythagoreanMeaning(1, lang);
  };

  const isMaster = (num: number) => [11, 22, 33].includes(num);

  const tabs = [
    { 
      id: 'lifePath', 
      title: t("num.tab.lp.title"), 
      num: data.lifePath, 
      desc: t("num.tab.lp.desc"),
      formula: t("num.tab.lp.f")
    },
    { 
      id: 'expression', 
      title: t("num.tab.ex.title"), 
      num: data.expression, 
      desc: t("num.tab.ex.desc"),
      formula: t("num.tab.ex.f")
    },
    { 
      id: 'soulUrge', 
      title: t("num.tab.su.title"), 
      num: data.soulUrge, 
      desc: t("num.tab.su.desc"),
      formula: t("num.tab.su.f") 
    },
    { 
      id: 'personality', 
      title: t("num.tab.pe.title"), 
      num: data.personality, 
      desc: t("num.tab.pe.desc"),
      formula: t("num.tab.pe.f") 
    },
    { 
      id: 'maturity', 
      title: t("num.tab.ma.title"), 
      num: data.maturity, 
      desc: t("num.tab.ma.desc"),
      formula: t("num.tab.ma.f")
    }
  ] as const;

  const currentTabData = tabs.find(t => t.id === activeTab)!;
  const currentMeaning = getMeaningObj(currentTabData.num);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      {/* Top Clinical/Math Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-teal-500/30 transition-colors">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-500/10 blur-[50px] pointer-events-none" />
            <h4 className="text-xs font-black text-teal-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <span>🧬</span> {t("num.nm.title")} 
            </h4>
            <div className="flex flex-col gap-6 border-t border-white/5 pt-4 mt-2 h-full max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              <div className="space-y-3">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">👇 {t("num.nm.passive")}</span>
                {neuroMatrix.missing.length > 0 ? (
                  neuroMatrix.missing.map((num: number) => (
                    <div key={`missing-${num}`} className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
                      <span className="font-black text-red-400 mr-2 text-lg">{num}</span>
                      <span className="text-xs text-gray-300 leading-relaxed font-light">{freqExplanations.passive[num as keyof typeof freqExplanations.passive]}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">{t("num.nm.none")}</span>
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">☝️ {t("num.nm.active")}</span>
                {neuroMatrix.excess.length > 0 ? (
                  neuroMatrix.excess.map((num: number) => (
                    <div key={`excess-${num}`} className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-3">
                      <span className="font-black text-amber-400 mr-2 text-lg">{num}</span>
                      <span className="text-xs text-gray-300 leading-relaxed font-light">{freqExplanations.active[num as keyof typeof freqExplanations.active]}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">{t("num.nm.none")}</span>
                )}
              </div>
            </div>
         </div>

         <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 group hover:border-amber-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative w-24 h-24 rounded-full border-4 border-amber-500/20 flex flex-col items-center justify-center shrink-0">
               <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">% {cosmicResonance}</span>
            </div>
            <div>
               <h4 className="text-xs font-black text-amber-400 tracking-widest uppercase mb-2 block">
                {t("num.res.title")}
               </h4>
               <p className="text-xs text-gray-400 leading-relaxed font-light">
                 {t("num.res.desc")}
               </p>
            </div>
         </div>
      </div>

      <div className="w-full bg-[#12081c]/80 backdrop-blur-xl rounded-[2.5rem] border border-purple-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-6 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-fuchsia-300 to-purple-500 mb-3 pb-2 tracking-wide">
            {t("num.core.title")}
          </h2>
          <p className="text-sm md:text-base text-purple-200/60 font-light">{t("num.core.sub")}</p>
        </div>

        {/* Tabs Header */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-5 py-3 rounded-2xl flex flex-col items-center transition-all duration-500 border
                ${activeTab === tab.id 
                  ? 'bg-purple-600/20 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
              `}
            >
              <span className={`text-2xl md:text-3xl font-black mb-1 ${isMaster(tab.num) ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-white'}`}>
                {tab.num}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">{tab.title}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content (Detailed Report) */}
        <div className="bg-black/50 p-6 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
          
          {currentMeaning && (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
                <div>
                  <h3 className="text-2xl md:text-4xl font-brand font-bold text-white flex items-center gap-4 mb-2">
                    <span className={`text-5xl ${isMaster(currentTabData.num) ? 'text-amber-400' : 'text-fuchsia-400'}`}>
                      {currentTabData.num}
                    </span> 
                    <span className="tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-100 to-purple-300 py-1">{currentMeaning.title}</span>
                  </h3>
                  <p className="text-[10px] text-fuchsia-300/60 font-bold tracking-[0.3em] uppercase">
                    {currentTabData.title} • {currentTabData.desc}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl flex flex-col items-center">
                   <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">{t("num.lbl.archetype")}</span>
                   <span className="text-sm font-black text-cyan-300 tracking-wider text-center">{currentMeaning.jungianArchetype}</span>
                </div>
              </div>

              {/* Information / Methodology Panel */}
              <div className="mb-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex gap-4 items-start animate-pulse hover:animate-none transition-all">
                <span className="text-indigo-400 text-xl shrink-0">ℹ️</span>
                <div>
                  <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t("num.lbl.method")}</h5>
                  <p className="text-[11px] text-gray-400 leading-normal italic">{currentTabData.formula}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sol Taraf: Metafizik & Nörobilim */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="text-lg">🌌</span> {t("num.lbl.nature")}
                    </h4>
                    <p className="text-gray-300 text-[15px] leading-relaxed font-light italic pl-4 border-l-2 border-indigo-500/30">
                      "{currentMeaning.general}"
                    </p>
                  </div>
                  <div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-500/20 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-t-2xl" />
                    <h4 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="text-lg">🧠</span> {t("num.lbl.neuro")}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">
                      {currentMeaning.neuroscience}
                    </p>
                  </div>
                </div>

                {/* Sağ Taraf: Gölge, Kariyer & Aşk */}
                <div className="space-y-6">
                  <div className="bg-black/60 p-6 rounded-2xl border border-red-500/20 relative shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent rounded-t-2xl" />
                    <h4 className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="text-lg">🌑</span> {t("num.lbl.shadow")}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">
                      {currentMeaning.shadowWork}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="text-sm">💼</span> {t("num.lbl.mission")}
                      </h4>
                      <p className="text-gray-400 text-xs leading-relaxed font-light">
                        {currentMeaning.career}
                      </p>
                    </div>
                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] text-pink-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="text-sm">❤️</span> {t("num.lbl.love")}
                      </h4>
                      <p className="text-gray-400 text-xs leading-relaxed font-light">
                        {currentMeaning.love}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terapötik Öğüt */}
              <div className="border-l-4 border-l-cyan-500 pl-6 bg-gradient-to-r from-cyan-900/20 to-transparent p-5 rounded-r-2xl flex items-start gap-4">
                <span className="text-2xl">💊</span>
                <div>
                  <h4 className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-2">{t("num.lbl.advice")}</h4>
                  <p className="text-white font-medium text-sm leading-relaxed drop-shadow-sm">
                    {currentMeaning.advice}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
