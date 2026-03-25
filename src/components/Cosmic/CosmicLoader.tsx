"use client";

export default function CosmicLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative w-24 h-24">
        {/* Pulsing Aura */}
        <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Spinning Zodiac Wheel */}
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500/20" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" className="text-purple-500/40" />
          
          {/* Symbols or dots representing signs */}
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              cx={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
              cy={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
              r="1.5"
              className="fill-purple-400"
            />
          ))}
        </svg>

        {/* Center Crystal Ball */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-bounce-subtle" />
        </div>
      </div>
      
      {label && (
        <p className="text-purple-300 font-medium tracking-widest uppercase text-sm animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
