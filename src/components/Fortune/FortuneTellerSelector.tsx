"use client";

import { FortuneTeller, fortuneTellers } from "@/data/fortune-tellers";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

interface FortuneTellerSelectorProps {
  onSelect: (teller: FortuneTeller) => void;
  selectedId?: string;
}

export default function FortuneTellerSelector({ onSelect, selectedId }: FortuneTellerSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-brand">
          {t("fortune.selection.title")}
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          {t("fortune.selection.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {fortuneTellers.map((teller) => (
          <div
            key={teller.id}
            onClick={() => onSelect(teller)}
            className={`
              relative cursor-pointer group rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500
              hover:-translate-y-2 active:scale-95
              ${selectedId === teller.id 
                ? "ring-4 ring-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] bg-pink-500/10" 
                : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
              }
            `}
          >
            {/* Avatar Image */}
            <div className="aspect-[4/5] relative overflow-hidden">
              <Image
                src={teller.avatar}
                alt={t(teller.nameKey || "fortune.teller." + teller.id + ".name")}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent opacity-80" />
              
              {/* Overlay Badge */}
              {selectedId === teller.id && (
                <div className="absolute top-4 right-4 bg-pink-500 text-white p-2 rounded-full shadow-lg animate-in fade-in zoom-in">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 text-center">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">
                {t(teller.nameKey || "fortune.teller." + teller.id + ".name")}
              </h3>
              <p className="text-pink-300/80 text-[11px] font-bold uppercase tracking-widest mb-3">
                {t(teller.titleKey || "fortune.teller." + teller.id + ".title")}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 md:line-clamp-3">
                {t(teller.descKey || "fortune.teller." + teller.id + ".desc")}
              </p>
            </div>

            {/* Selection indicator bar */}
            {selectedId === teller.id && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 transition-all duration-300"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
