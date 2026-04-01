'use client';

import React, { useState, useEffect } from 'react';
import { getDailyNumerology } from '@/lib/numerology/cycles';
import { getPersonalYearMeaning, getPersonalMonthMeaning, getPersonalDayMeaning } from '@/data/numerology/meanings';
import { SupportedLanguage } from '@/lib/i18n-shared';

// Add a tiny circle stat component inline for the macro layout
const CircleStat = ({ label, value, colorClass, desc }: any) => (
  <div className="flex flex-col items-center">
    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${colorClass} bg-black/40 flex items-center justify-center mb-3 shadow-lg`}>
      <span className="text-2xl md:text-3xl font-black">{value}</span>
    </div>
    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center whitespace-nowrap">{label}</span>
    <span className="hidden md:block text-[9px] text-gray-500 mt-1 max-w-[80px] text-center">{desc}</span>
  </div>
);

export default function CyclesDashboard({ dobString, lang = 'tr' }: { dobString: string, lang?: SupportedLanguage }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!dobString || !mounted) return null;

  const cycles = getDailyNumerology(dobString);
  const now = new Date();
  
  const formattedDate = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : lang === 'ar' ? 'ar-SA' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const yearMeaning = getPersonalYearMeaning(cycles.personal.year, lang);
  const monthMeaning = getPersonalMonthMeaning(cycles.personal.month, lang);
  const dayMeaning = getPersonalDayMeaning(cycles.personal.day, lang);

  const uiDicts = {
    tr: {
      title: "Numerolojik Yaşam Döngüleri",
      sub: "Kişisel Frekans ve Enerji Takvimi",
      l1: "1. Katman • Mevcut Yılın Teması (Rotanız)",
      l1act: "Nöroplastisite Fırsatı (Ne Yapmalı?)",
      l1trap: "Limbik Sistem Tuzağı (Neden Kaçınmalı?)",
      l2: "2. Katman • Bu Ayki Odak Noktanız",
      l3: "3. Katman • Bugünün Enerjisi (Hızlı Aksiyon)",
      method: "Hesaplama Metodolojisi",
      univ: "Evrensel (Kolektif) Frekans",
      univMeth: "Ekranda gördüğünüz değerler takvim tarihleri değil, evrensel fazlardır. Makro rüzgar her zaman kişisel rotanızı etkiler.",
      univTip: "🌍 Peki Bu Kolektif Rüzgarı Bugün Nasıl Kullanmalısın?"
    },
    en: {
      title: "Numerological Life Cycles",
      sub: "Personal Frequency & Energy Calendar",
      l1: "Layer 1 • Current Year Theme (Your Course)",
      l1act: "Neuroplasticity Opportunity (What to do?)",
      l1trap: "Limbic System Trap (What to avoid?)",
      l2: "Layer 2 • This Month's Focus",
      l3: "Layer 3 • Today's Energy (Quick Action)",
      method: "Calculation Methodology",
      univ: "Universal (Collective) Frequency",
      univMeth: "The values you see are universal phases, not calendar dates. The macro wind always influences your personal course.",
      univTip: "🌍 How Should You Use This Collective Wind Today?"
    },
    ar: {
      title: "دورات الحياة العددية",
      sub: "التردد الشخصي وتقويم الطاقة",
      l1: "الطبقة 1 • موضوع السنة الحالية (مسارك)",
      l1act: "فرصة المرونة العصبية (ماذا تفعل؟)",
      l1trap: "فخ الجهاز الحوفي (ما يجب تجنبه؟)",
      l2: "الطبقة 2 • تركيز هذا الشهر",
      l3: "الطبقة 3 • طاقة اليوم (إجراء سريع)",
      method: "منهجية الحساب",
      univ: "التردد العالمي الجماعي",
      univMeth: "القيم التي تراها هي مراحل عالمية، وليست تواريخ تقويم. الرياح الكلية تؤثر دائمًا على مسارك الشخصي.",
      univTip: "🌍 كيف يجب أن تستخدم هذه الرياح الجماعية اليوم؟"
    },
    de: {
      title: "Numerologische Lebenszyklen",
      sub: "Persönlicher Frequenz- und Energiekalender",
      l1: "Ebene 1 • Thema des aktuellen Jahres",
      l1act: "Neuroplastizitätsmöglichkeit (Was tun?)",
      l1trap: "Limbische Systemfalle (Was vermeiden?)",
      l2: "Ebene 2 • Fokus dieses Monats",
      l3: "Ebene 3 • Heutige Energie (Schnelle Aktion)",
      method: "Berechnungsmethode",
      univ: "Universelle (Kollektive) Frequenz",
      univMeth: "Die Werte sind universelle Phasen, keine Kalenderdaten. Der Makrowind beeinflusst deinen Kurs.",
      univTip: "🌍 Wie solltest du diesen kollektiven Wind heute nutzen?"
    },
    fr: {
      title: "Cycles de Vie Numérologiques",
      sub: "Calendrier Personnel de Fréquence et d'Énergie",
      l1: "Couche 1 • Thème de l'Année (Votre Cap)",
      l1act: "Opportunité de Neuroplasticité (Que faire ?)",
      l1trap: "Piège du Système Limbique (À éviter ?)",
      l2: "Couche 2 • Focus de ce Mois",
      l3: "Couche 3 • Énergie du Jour (Action Rapide)",
      method: "Méthodologie de Calcul",
      univ: "Fréquence Universelle (Collective)",
      univMeth: "Les valeurs sont des phases universelles. Le vent macro influence toujours votre cap personnel.",
      univTip: "🌍 Comment Devriez-vous Utiliser Ce Vent Collectif Aujourd'hui ?"
    }
  };
  
  const uiDict = uiDicts[lang as keyof typeof uiDicts] || uiDicts['tr'];

  const getShortNumDesc = (num: number) => {
    return {
      tr: { 1:"Başlangıçlar", 2:"Ortaklık", 3:"İfade", 4:"Disiplin", 5:"Özgürlük", 6:"Şifa", 7:"İçsel", 8:"Güç", 9:"Tamamlanma" },
      en: { 1:"Beginnings", 2:"Partnership", 3:"Expression", 4:"Discipline", 5:"Freedom", 6:"Healing", 7:"Inner", 8:"Power", 9:"Completion" },
      ar: { 1:"بدايات", 2:"شراكة", 3:"تعبير", 4:"انضباط", 5:"حرية", 6:"شفاء", 7:"داخلي", 8:"قوة", 9:"اكتمال" },
      de: { 1:"Anfänge", 2:"Partnerschaft", 3:"Ausdruck", 4:"Disziplin", 5:"Freiheit", 6:"Heilung", 7:"Innerlich", 8:"Macht", 9:"Abschluss" },
      fr: { 1:"Débuts", 2:"Partenariat", 3:"Expression", 4:"Discipline", 5:"Liberté", 6:"Guérison", 7:"Intériorité", 8:"Pouvoir", 9:"Achèvement" }
    }[lang]?.[num as 1|2|3|4|5|6|7|8|9] || "";
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-transparent to-cyan-600/20 rounded-[3rem] blur-xl group-hover:opacity-100 transition-opacity opacity-50 pointer-events-none" />
      
      <div className="relative p-6 md:p-12 bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 pointer-events-none" />

        {/* Header Region */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-10 relative z-10 gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg border border-white/20">🧠</div>
             <div>
               <h3 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-1">
                 {uiDict.title}
               </h3>
               <p className="text-[10px] md:text-xs text-fuchsia-400 font-bold uppercase tracking-[0.2em]">
                 {uiDict.sub}
               </p>
             </div>
          </div>
          <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 font-bold tracking-wider text-teal-200 shadow-inner">
            {formattedDate}
          </div>
        </div>

        {/* Main Content: The Vertical Timeline */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">

          {/* LAYER 1: THE YEAR (Macro Focus) */}
          <div className="bg-gradient-to-br from-teal-900/10 to-indigo-900/10 p-6 md:p-8 rounded-[2.5rem] border border-teal-500/30 relative overflow-hidden group hover:border-teal-400/50 transition-colors">
            <div className="absolute -right-10 -top-10 opacity-10 blur-sm mix-blend-screen pointer-events-none transform rotate-12 scale-150">
              <svg width="200" height="400" viewBox="0 0 100 200"><path d="M10,10 Q50,50 90,10 T10,90 T90,170" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M90,10 Q50,50 10,10 T90,90 T10,170" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/></svg>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
               <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-full border-4 border-teal-500/40 bg-black/40 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                  <span className="text-[10px] uppercase font-black tracking-widest text-teal-500 mb-1">Yıl</span>
                  <span className="text-4xl font-black text-white leading-none">{cycles.personal.year}</span>
               </div>
               <div>
                  <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-400 mb-2">{uiDict.l1}</h4>
                  <p className="text-[11px] text-teal-200 mb-3 bg-teal-900/30 inline-block px-3 py-1.5 rounded-lg border border-teal-500/20 italic">
                    <strong className="text-white font-black">{uiDict.method}:</strong> {cycles.personal.year} = <span className="font-bold text-teal-300">"{getShortNumDesc(cycles.personal.year)}"</span>
                  </p>
                  <h5 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                    {yearMeaning.title}
                  </h5>
                  <p className="text-sm text-gray-300 font-light leading-relaxed">
                    {yearMeaning.focus}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-teal-500/20 pt-6">
               <div className="relative pl-6 before:absolute before:left-0 before:top-1 before:bottom-0 before:w-1 before:bg-green-500 before:rounded-full">
                  <h6 className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1.5">{uiDict.l1act}</h6>
                  <p className="text-xs text-white font-medium leading-relaxed drop-shadow-sm">{yearMeaning.action}</p>
               </div>
               <div className="relative pl-6 before:absolute before:left-0 before:top-1 before:bottom-0 before:w-1 before:bg-red-500 before:rounded-full">
                  <h6 className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1.5">{uiDict.l1trap}</h6>
                  <p className="text-xs text-red-200/90 font-light italic leading-relaxed">{yearMeaning.warning}</p>
               </div>
            </div>
          </div>

          {/* LAYER 2: THE MONTH (Mid Focus) */}
          <div className="bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-indigo-500/20 flex flex-col md:flex-row gap-6 items-center hover:border-indigo-400/40 transition-colors">
            <div className="flex flex-col items-center justify-center shrink-0 w-20 h-20 rounded-full border-2 border-indigo-500/40 bg-indigo-900/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 mb-1">Ay</span>
                <span className="text-3xl font-black text-white leading-none">{cycles.personal.month}</span>
            </div>
            <div>
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-400 mb-1">{uiDict.l2}</h4>
                <p className="text-[10px] text-indigo-200 mb-3 bg-indigo-900/30 inline-block px-3 py-1.5 rounded-lg border border-indigo-500/20 italic">
                  <strong className="text-white font-black">{uiDict.method}:</strong> {cycles.personal.month} = <span className="font-bold text-indigo-300">"{getShortNumDesc(cycles.personal.month)}"</span>
                </p>
                <p className="text-sm text-gray-300 font-light leading-relaxed">
                  "{monthMeaning}"
                </p>
            </div>
          </div>

          {/* LAYER 3: THE DAY (Micro Focus) */}
          <div className="bg-gradient-to-r from-blue-900/20 to-transparent p-6 md:p-8 rounded-[2.5rem] border border-blue-500/20 flex flex-col md:flex-row gap-6 items-center hover:border-blue-400/40 transition-colors">
            <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-full border-2 border-blue-500/40 bg-blue-900/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <span className="text-[8px] uppercase font-black tracking-widest text-blue-400 mb-0.5">D</span>
                <span className="text-2xl font-black text-white leading-none">{cycles.personal.day}</span>
            </div>
            <div>
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-400 mb-1 flex items-center gap-2">
                  <span>⚡</span> {uiDict.l3}
                </h4>
                <p className="text-[10px] text-blue-200 mb-2 bg-blue-900/30 inline-block px-3 py-1.5 rounded-lg border border-blue-500/20 italic">
                  <strong className="text-white font-black">{uiDict.method}:</strong> {cycles.personal.day} = <span className="font-bold text-blue-300">"{getShortNumDesc(cycles.personal.day)}"</span>
                </p>
                <p className="text-base text-blue-100 font-medium leading-relaxed">
                  {dayMeaning}
                </p>
            </div>
          </div>

        </div>

        {/* Global/Universal Context Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col items-center md:items-start gap-3 relative z-10 text-center md:text-left">
           <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-xs text-gray-400">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">{uiDict.univ}</span> 
             </div>
             <div className="flex items-center gap-3 font-black tracking-widest bg-black/40 px-5 py-2 rounded-full border border-white/5 text-[10px]">
                <span className="text-purple-400">Y: {cycles.universal.year}</span>
                <span className="text-gray-600">•</span>
                <span className="text-pink-400">A: {cycles.universal.month}</span>
                <span className="text-gray-600">•</span>
                <span className="text-rose-400">G: {cycles.universal.day}</span>
             </div>
           </div>
           
           <p className="text-[10px] text-gray-400/80 font-light italic max-w-4xl leading-relaxed mb-1">
             <strong className="text-gray-300 font-bold tracking-wider">{uiDict.method}:</strong> {uiDict.univMeth}
           </p>

           <div className="mt-2 bg-gradient-to-r from-purple-900/40 to-transparent p-4 rounded-xl border border-purple-500/20 max-w-4xl">
             <p className="text-xs text-purple-200">
               <strong className="text-purple-400 tracking-widest uppercase text-[10px] block mb-1">{uiDict.univTip}</strong>
               {(() => {
                 const tips: Record<number, string> = {
                   1: "Bugün dünya genelinde liderlik ve yenilik enerjisi hakim. Kalabalıklara uymak yerine kendi fikrini öne sürmek ve ilk adımı atmak için harika bir gün.",
                   2: "Bugün kolektif olarak hassas ve empatik bir gündeyiz. Tartışmalardan kaçının ve insanlarla işbirliği yapmaya odaklanın.",
                   3: "Bugün gezegende iletişim ve neşe kanalları açık! Ağır işler yerine sosyalleşeceğin, beyin fırtınaları ve sunumlar yapabileceğin bir gün.",
                   4: "Bugün yerçekimi ağır basıyor. Uçarı fikirleri bırakıp ertelenmiş evrak işlerini, temizliği veya finansal planlamayı halletme günü.",
                   5: "Bugün dünyada sürprizlere ve değişime açık bir rüzgar esiyor. Rutini kırın, farklı bir şey deneyin, katı planlarda esnek olun.",
                   6: "Bugün şifa ve yuva enerjisi devrede. Ailenizle, evinizle, evcil hayvanlarınızla zaman geçirmek veya sevdiklerinize destek olmak için dünyadaki en iyi gün.",
                   7: "Bugün gezegende içe dönük, psişik ve analitik bir yansıma var. Hızlı karar almak veya sosyalleşmek yerine araştırın, okuyun ve ruhunuzu dinlendirin.",
                   8: "Bugün finansal piyasaların, evrensel otoritenin ve güç gösterilerinin günü. Maddi yatırımlarınızı, kariyer görüşmelerinizi veya resmi işlerinizi masaya yatırın.",
                   9: "Bugün evrensel arınma günü. Yarın başlayacak yeni '1' döngüsü öncesinde bitmiş dosyaları kapatın, affedin ve size yük olan eşyaları/düşünceleri tahliye edin."
                 };
                 return tips[cycles.universal.day] || "";
               })()}
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}
