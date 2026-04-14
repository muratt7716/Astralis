"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen cosmic-gradient flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-10 text-center animate-fade-in relative z-10 border-t-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="text-6xl mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">🌌</div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-4 font-serif">
          Kozmik Ağda Dalgalanma
        </h2>
        <p className="text-gray-300 text-lg mb-8 font-light relative z-10">
          Yıldızlarla olan bağlantımız geçici olarak kesildi. Lütfen tekrar bağlanmayı deneyin.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/10 relative overflow-hidden group font-medium"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🔄</span> Yeniden Dene
            </span>
          </button>
          
          <Link
            href="/"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] relative overflow-hidden group font-medium"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🏠</span> Ana Frekansa Dön
            </span>
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow object-delay-200"></div>
      </div>
    </div>
  );
}
