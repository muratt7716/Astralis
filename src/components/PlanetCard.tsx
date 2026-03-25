"use client";

import React from "react";
import Image from "next/image";
import { Planet } from "@/data/planets";
import { zodiacSigns } from "@/data/zodiac";

interface PlanetCardProps {
  planet: Planet;
  index: number;
}

export default function PlanetCard({ planet, index }: PlanetCardProps) {
  const ruledSigns = zodiacSigns.filter((s) =>
    planet.rulesSign.includes(s.id)
  );

  return (
    <div
      className="glass-card overflow-hidden group hover:border-white/20 transition-all duration-500 fade-in-up shadow-2xl"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
        {/* Left: Media & Identity */}
        <div className="md:w-56 flex-shrink-0 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 group-hover:scale-105 transition-transform duration-700">
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              style={{ backgroundColor: planet.color }}
            ></div>

            {/* Image */}
            <div className="relative w-full h-full float">
              <Image
                src={planet.imageUrl}
                alt={planet.name}
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{planet.name}</h2>
          <p className="text-gray-400 text-sm italic mb-4 font-serif">{planet.symbol} Yönetici Gezegen</p>

          <div className="flex flex-wrap gap-2 justify-center">
            {ruledSigns.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs flex items-center gap-1.5"
                style={{ borderColor: `${planet.color}33` }}
              >
                <span className="text-lg leading-none">{s.symbol}</span>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Insights */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-gray-200 text-lg leading-relaxed mb-6 font-light">
            {planet.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Etki Alanı</h4>
              <p className="text-white font-medium">{planet.influence}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Element & Transit</h4>
              <p className="text-white font-medium">{planet.element} • {planet.transitDuration}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                Olumlu Etkiler
              </h4>
              <div className="flex flex-wrap gap-2">
                {planet.positiveEffects.map((e) => (
                  <span key={e} className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span>
                Olumsuz Etkiler
              </h4>
              <div className="flex flex-wrap gap-2">
                {planet.negativeEffects.map((e) => (
                  <span key={e} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
