"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size }: LogoProps) {
  const sizeStyle = size ? { width: size, height: size } : {};
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} 
         style={sizeStyle}>
      {/* The Logo Image */}
      <div className="relative z-10 w-full h-full transform hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-white/10">
        <Image
          src="/logo_final.png"
          alt="Astralis Logo"
          fill
          className="object-cover"
          priority
        />
        
        {/* Shimmer / Sparkle Effect overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-overlay">
          <div className="absolute top-0 -left-[150%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-25deg] animate-[shimmer_2.5s_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(0); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
