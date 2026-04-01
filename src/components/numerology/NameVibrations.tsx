'use client';

import React from 'react';
import { getChaldeanAnalysis } from '@/lib/numerology/chaldean';
import { SupportedLanguage } from '@/lib/i18n-shared';

type WordBreakdown = {
  word: string;
  compound: number;
  root: number;
};

export default function NameVibrations({ name, lang = 'tr' }: { name: string, lang?: SupportedLanguage }) {
  if (!name) return null;

  const analysis = getChaldeanAnalysis(name, lang);

  const uiDicts = {
    tr: {
      title: "Keldani İsim Titreşimi",
      sub: "Cheiro'nun Kadim Gizemleri",
      planet: "Evrensel Etki Gezegeni",
      comp: "Bileşik Sayı",
      root: "Kök Sayı",
      methT: "Keldani (Cheiro) Metodolojisi Nedir?",
      methD: "Pisagor sisteminden farklı olarak Keldani numerolojisi, harfleri ses tınlılarına ve antik alfabelere göre eşleştirir. Buradaki Bileşik Sayı, kontrolün dışındaki kozmik güçleri; Kök Sayı ise karakterini gösterir. Sistemde 9 rakamı kutsal kabul edildiği için harflere direkt atanmaz, sadece toplamda çıkarsa büyük bir uyarıdır.",
      word: "Ayrıntılı Kelime Titreşimi",
      lblComp: "Bileşik",
      lblRoot: "Kök"
    },
    en: {
      title: "Chaldean Name Vibration",
      sub: "Ancient Mysteries of Cheiro",
      planet: "Universal Planet of Influence",
      comp: "Compound Number",
      root: "Root Number",
      methT: "What is Chaldean (Cheiro) Methodology?",
      methD: "Unlike Pythagoras, Chaldean numerology matches letters to sound frequencies and ancient alphabets. The Compound Number shows cosmic forces beyond control; the Root Number shows your character. Number 9 is sacred, never assigned to a letter.",
      word: "Detailed Word Vibration",
      lblComp: "Compound",
      lblRoot: "Root"
    },
    ar: {
      title: "اهتزاز الاسم الكلداني",
      sub: "أسرار تشيرو القديمة",
      planet: "كوكب التأثير العالمي",
      comp: "الرقم المركب",
      root: "رقم الجذر",
      methT: "ما هي منهجية الكلدانية (تشيرو)؟",
      methD: "على عكس فيثاغورس، تطابق الأرقام الكلدانية الحروف مع الترددات الصوتية والأبجديات القديمة. الرقم 9 مقدس ولا يتم تعيينه أبدًا لأي حرف.",
      word: "اهتزاز الكلمة المفصل",
      lblComp: "مركب",
      lblRoot: "جذر"
    },
    de: {
      title: "Chaldäische Namensschwingung",
      sub: "Antike Mysterien des Cheiro",
      planet: "Universeller Einflussplanet",
      comp: "Verbundene Zahl",
      root: "Wurzelzahl",
      methT: "Was ist die chaldäische (Cheiro) Methodik?",
      methD: "Im Gegensatz zu Pythagoras ordnet die chaldäische Numerologie Buchstaben Klangfrequenzen zu. Die verbundene Zahl zeigt kosmische Kräfte. Die Zahl 9 ist heilig.",
      word: "Detaillierte Wortschwingung",
      lblComp: "Verbund",
      lblRoot: "Wurzel"
    },
    fr: {
      title: "Vibration du Nom Chaldéen",
      sub: "Anciens Mystères de Cheiro",
      planet: "Planète d'Influence Universelle",
      comp: "Nombre Composé",
      root: "Nombre Racine",
      methT: "Qu'est-ce que la Méthodologie Chaldéenne ?",
      methD: "Contrairement à Pythagore, la numérologie chaldéenne associe les lettres aux fréquences sonores. Le nombre composé montre les forces cosmiques. Le chiffre 9 est sacré.",
      word: "Vibration Détaillée du Mot",
      lblComp: "Composé",
      lblRoot: "Racine"
    }
  };
  const uiDict = uiDicts[lang as keyof typeof uiDicts] || uiDicts['tr'];

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-[#0c0514]/80 backdrop-blur-2xl rounded-[3rem] border border-fuchsia-500/20 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        
        {/* Background Aura */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-fuchsia-600/10 blur-[100px] pointer-events-none group-hover:bg-fuchsia-600/20 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-1">
              {uiDict.title}
            </h3>
            <p className="text-xs text-fuchsia-400 font-bold uppercase tracking-[0.3em]">{uiDict.sub}</p>
          </div>
          
          <div className="flex items-center gap-6 bg-black/40 px-8 py-4 rounded-3xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">{uiDict.planet}</span>
              <span className="text-lg font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                {analysis.destinyPlanet}
              </span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">{uiDict.comp}</span>
              <span className="text-2xl font-black text-white">{analysis.compoundNumber}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">{uiDict.root}</span>
              <span className="text-2xl font-black text-fuchsia-400">{analysis.rootNumber}</span>
            </div>
          </div>
        </div>

        <div className="mb-10 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row gap-6 items-center">
           <div className="text-4xl">🔱</div>
           <div className="space-y-2">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{uiDict.methT}</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-light italic">
                {uiDict.methD}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1.8fr] gap-12">
          {/* Main Meaning */}
          <div className="bg-gradient-to-br from-fuchsia-900/20 to-indigo-900/20 p-8 rounded-[2.5rem] border border-fuchsia-500/20 relative">
            <h4 className="text-4xl font-black text-white mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">{analysis.compoundNumber}</h4>
            <h5 className="text-xl font-bold text-fuchsia-300 mb-6">{analysis.meaning.title}</h5>
            <p className="text-gray-300 leading-relaxed font-light text-lg italic">
              "{analysis.meaning.meaning}"
            </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-fuchsia-500/20 scrollbar-track-transparent">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">{uiDict.word}</h4>
            {analysis.breakdown.map((item: WordBreakdown, idx: number) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all"
              >
                <span className="text-lg font-black text-white tracking-widest uppercase">{item.word}</span>
                <div className="flex gap-6 items-center">
                  <div className="text-center">
                     <span className="text-[9px] text-gray-500 uppercase block">{uiDict.lblComp}</span>
                    <span className="font-bold text-white">{item.compound}</span>
                  </div>
                  <div className="text-center">
                     <span className="text-[9px] text-gray-500 uppercase block">{uiDict.lblRoot}</span>
                    <span className="font-bold text-fuchsia-400">{item.root}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
