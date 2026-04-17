import React from 'react';

interface ZodiacIconProps {
  signId: string;
  className?: string;
  size?: number;
  glowColor?: string;
  variant?: 'image' | 'classic';
}

const ZodiacIcon: React.FC<ZodiacIconProps> = ({ signId, className = '', size = 24, glowColor = '#ffffff', variant = 'image' }) => {
  const isImage = variant === 'image' && ['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'].includes(signId);

  const icons: Record<string, React.ReactNode> = {
    koc: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 90V40M50 40C40 10 10 10 10 25M50 40C60 10 90 10 90 25" />
      </g>
    ),
    boga: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="60" r="25" />
        <path d="M15 15C15 45 85 45 85 15" />
      </g>
    ),
    ikizler: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 10H75M25 90H75M40 10V90M60 10V90" />
      </g>
    ),
    yengec: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="25" cy="35" r="15" />
        <circle cx="75" cy="65" r="15" />
        <path d="M40 35H85M15 65H60" />
        <path d="M85 35C85 15 65 15 50 25M15 65C15 85 35 85 50 75" />
      </g>
    ),
    aslan: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="30" cy="70" r="15" />
        <path d="M30 55C30 30 60 10 75 35C85 55 60 85 85 90" />
      </g>
    ),
    basak: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 30V80M40 30V80M60 30V80M20 30C20 10 40 10 40 30C40 10 60 10 60 30C60 10 80 10 80 30V85C80 95 65 95 65 85L80 50" />
      </g>
    ),
    terazi: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 90H90M10 70H35C35 70 35 40 50 40C65 40 65 70 90 70" />
      </g>
    ),
    akrep: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 30V80M40 30V80M60 30V80M20 30C20 10 40 10 40 30C40 10 60 10 60 30M60 80L85 55L90 65" />
      </g>
    ),
    yay: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 90L90 10M50 10H90V50M35 55L55 75" />
      </g>
    ),
    oglak: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20L40 80L60 30C60 10 90 10 90 40C90 70 70 90 50 90" />
        <circle cx="50" cy="90" r="8" />
      </g>
    ),
    kova: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 40L30 20L50 40L70 20L90 40M10 70L30 50L50 70L70 50L90 70" />
      </g>
    ),
    balik: (
      <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 15C10 35 10 65 30 85M70 15C90 35 90 65 70 85M10 50H90" />
      </g>
    ),
  };

  if (isImage) {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div
          className="absolute inset-0 blur-2xl opacity-60 rounded-full animate-pulse"
          style={{ backgroundColor: glowColor }}
        />
        <img
          src={`/images/zodiac/${signId}.png`}
          alt={signId}
          className="relative z-10 w-full h-full object-cover rounded-[inherit] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`relative ${className}`}
      style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
    >
      {/* Background Glow Layer */}
      <g opacity="0.3" style={{ filter: 'blur(4px)' }}>
        {icons[signId] || icons.koc}
      </g>
      {/* Sharp Highlight Layer */}
      <g className="text-white">
        {icons[signId] || icons.koc}
      </g>
    </svg>
  );
};

export default ZodiacIcon;
