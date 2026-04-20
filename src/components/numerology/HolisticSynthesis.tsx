'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, Compass, Activity, Loader2 } from 'lucide-react';
import { SupportedLanguage, translations } from '@/lib/i18n-shared';

type HolisticSynthesisProps = {
  fullName: string;
  dob: string;
  coreNumbers: any;
  neuroMatrix: any;
  lang: SupportedLanguage;
  userId?: string;
};

export default function HolisticSynthesis({ fullName, dob, coreNumbers, neuroMatrix, lang, userId }: HolisticSynthesisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = (key: string) => translations[lang]?.[key] || translations['tr'][key] || key;

  const generateSynthesis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/numerology/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          dob,
          coreNumbers,
          neuroMatrix,
          language: lang,
          userId
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Bilinmeyen bir hata oluştu');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (trLabel: string, enLabel: string) => lang === 'tr' ? trLabel : enLabel;

  if (!analysis && !loading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-12 bg-black/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center group hover:border-indigo-500/40 transition-colors">
        <Brain className="w-16 h-16 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300 mb-4">
          {getLabel("Klinik ve Ezoterik Sentez", "Clinical & Esoteric Synthesis")}
        </h3>
        <p className="text-purple-200/60 max-w-2xl mb-8">
          {getLabel(
            "Çekirdek sayılarınızı ve nöromatris verilerinizi Pisagor kadim bilgeliği, Jungian bilinçaltı arketipleri ve sinirbilimsel frekanslarla harmanlayarak bütüncül, size özel bir stratejik okuma oluşturun.",
            "Synthesize your core numbers and neuromatrix data with Pythagorean wisdom, Jungian subconscious archetypes, and neuroscientific frequencies to generate a holistic, strategic reading tailored specifically for you."
          )}
        </p>
        <button
          onClick={generateSynthesis}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-full font-bold text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {getLabel("Sentezi Başlat", "Begin Synthesis")}
          </span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-12 bg-black/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="relative">
          <Brain className="w-16 h-16 text-fuchsia-400 mb-6 animate-pulse" />
          <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-fuchsia-500 border-l-transparent rounded-full animate-spin duration-1000" />
        </div>
        <h3 className="text-xl font-bold text-fuchsia-200 mb-2 animate-pulse">
          {getLabel("Frekanslar Çözümleniyor...", "Decoding Frequencies...")}
        </h3>
        <p className="text-sm text-fuchsia-300/50">
          {getLabel("Jung arketipleri ve sinirbilimsel bağlar inceleniyor", "Analyzing Jungian archetypes and neuroscientific links")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-400 mb-4 pb-2">
          {getLabel("Klinik ve Ezoterik Sentez", "Clinical & Esoteric Synthesis")}
        </h2>
        <p className="text-indigo-200/60 flex items-center justify-center gap-2">
          <Brain className="w-4 h-4" /> 
          {getLabel("Nöral ve Spiritüel Profiliniz", "Your Neural & Spiritual Profile")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pisagor & Keldani */}
        <div className="bg-[#12081c]/80 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8 shadow-[inset_0_0_30px_rgba(251,191,36,0.03)] group hover:border-amber-500/40 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
          <h4 className="text-amber-400 font-bold uppercase tracking-widest text-xs flex items-center gap-3 mb-6">
            <Compass className="w-5 h-5 text-amber-500" />
            {getLabel("Kadim Kökler (Pisagor & Decoz)", "Ancient Roots (Pythagoras & Decoz)")}
          </h4>
          <p className="text-gray-300 leading-relaxed font-light text-[15px]">
            {analysis.pythagorean}
          </p>
        </div>

        {/* Jungian */}
        <div className="bg-[#12081c]/80 backdrop-blur-xl rounded-3xl border border-fuchsia-500/20 p-8 shadow-[inset_0_0_30px_rgba(217,70,239,0.03)] group hover:border-fuchsia-500/40 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full pointer-events-none" />
          <h4 className="text-fuchsia-400 font-bold uppercase tracking-widest text-xs flex items-center gap-3 mb-6">
            <span className="text-xl">🎭</span>
            {getLabel("Bilinçaltı Dinamikleri (Jungian)", "Subconscious Dynamics (Jungian)")}
          </h4>
          <p className="text-gray-300 leading-relaxed font-light text-[15px]">
            {analysis.jungian}
          </p>
        </div>

        {/* Neuroscience */}
        <div className="md:col-span-2 bg-[#06141f]/80 backdrop-blur-xl rounded-3xl border border-cyan-500/20 p-8 shadow-[inset_0_0_30px_rgba(6,182,212,0.03)] group hover:border-cyan-500/40 transition-colors relative overflow-hidden">
          <div className="absolute bottom-0 left-1/4 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-cyan-500" />
            {getLabel("Nöral Aktarımlar (Sinirbilim)", "Neural Transmissions (Neuroscience)")}
          </h4>
          <p className="text-gray-300 leading-relaxed font-light text-[15px]">
            {analysis.neuroscience}
          </p>
        </div>

        {/* Final Synthesis */}
        <div className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-3xl border border-indigo-400/30 p-8 shadow-[0_0_40px_rgba(79,70,229,0.1)] group hover:border-indigo-400/50 transition-colors">
          <h4 className="text-indigo-300 font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            {getLabel("Bütüncül Strateji", "Holistic Strategy")}
          </h4>
          <p className="text-white leading-relaxed font-medium text-lg drop-shadow-sm">
            {analysis.synthesis}
          </p>
        </div>

        {/* Healing Prescription */}
        <div className="md:col-span-2 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-8 shadow-[0_0_40px_rgba(16,185,129,0.1)] group hover:border-emerald-400/50 transition-colors">
          <h4 className="text-emerald-400 font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 mb-4">
            <span className="text-xl">🌿</span>
            {getLabel("Nöro-Mistik Şifa Reçetesi", "Neuro-Mystic Healing Prescription")}
          </h4>
          <p className="text-emerald-100/90 leading-relaxed font-medium text-[15px] drop-shadow-sm whitespace-pre-wrap">
            {typeof analysis.prescription === 'string' 
              ? analysis.prescription 
              : Object.values(analysis.prescription || {}).join('\\n\\n')}
          </p>
        </div>

      </div>

    </div>
  );
}
