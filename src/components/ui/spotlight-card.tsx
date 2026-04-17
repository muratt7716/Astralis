import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--x', x.toFixed(2));
    cardRef.current.style.setProperty('--xp', (x / rect.width).toFixed(2));
    cardRef.current.style.setProperty('--y', y.toFixed(2));
    cardRef.current.style.setProperty('--yp', (y / rect.height).toFixed(2));
    cardRef.current.style.setProperty('--opacity', '1');
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--opacity', '0');
  };

  const { base, spread } = glowColorMap[glowColor];

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: any = {
      '--base': base,
      '--spread': spread,
      '--radius': '24',
      '--border': '2',
      '--backdrop': 'hsl(0 0% 10% / 0.8)',
      '--backup-border': 'var(--backdrop)',
      '--size': '300',
      '--outer': '1',
      '--opacity': '0',
      '--x': '0',
      '--y': '0',
      '--xp': '0',
      '--yp': '0',
      '--saturation': '100',
      '--lightness': '70',
      '--bg-spot-opacity': '0.12', // Increased from 0.02 to 0.07 for better visibility
      '--border-spot-opacity': '1',
      '--border-light-opacity': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 200) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / calc(var(--opacity, 0) * var(--bg-spot-opacity, 0.1))), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: '100% 100%',
      backgroundPosition: '50% 50%',
      border: 'var(--border-size) solid transparent',
      position: 'relative' as const,
      touchAction: 'none' as const,
    };

    if (width !== undefined) baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    if (height !== undefined) baseStyles.height = typeof height === 'number' ? `${height}px` : height;

    return baseStyles;
  };

  const beforeAfterStyles = `
    .glow-card::before,
    .glow-card::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-repeat: no-repeat;
      
      /* Relaxed mask to allow bloom spill */
      -webkit-mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
      -webkit-mask-composite: destination-out;
      mask: linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff);
      mask-composite: exclude;
      
      transition: opacity 0.5s ease;
      opacity: var(--opacity, 0);
    }
    
    .glow-card::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 1.2) calc(var(--spotlight-size) * 1.2) at
        calc(var(--x, 0) * 1px + var(--border-size))
        calc(var(--y, 0) * 1px + var(--border-size)),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / 1), transparent 70%
      );
      filter: blur(15px) brightness(5); // BLAST: Huge blur and massive brightness
      z-index: 2;
    }
    
    .glow-card::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.6) calc(var(--spotlight-size) * 0.6) at
        calc(var(--x, 0) * 1px + var(--border-size))
        calc(var(--y, 0) * 1px + var(--border-size)),
        hsl(0 100% 100% / 1), transparent 100%
      );
      filter: brightness(1.5);
      z-index: 3;
    }
    
    .glow-card .glow-card-blur {
      position: absolute;
      inset: 0;
      opacity: var(--opacity, 0);
      transition: opacity 0.4s ease;
      border-radius: calc(var(--radius) * 1px);
      background: none;
      pointer-events: none;
      z-index: -1;
    }
    
    .glow-card .glow-card-blur::before {
      content: "";
      position: absolute;
      inset: -60px; // Wider reach
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 1.5) calc(var(--spotlight-size) * 1.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) 60% / 0.8), transparent 100% // BOOST: Increased opacity to 0.8
      );
      filter: blur(50px); // MASSIVE BLUR
      border-radius: calc(var(--radius) * 1px);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={getInlineStyles()}
        className={`
          glow-card
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-[24px] 
          relative 
          grid 
          grid-rows-[1fr_auto] 
          shadow-[0_1rem_2rem_-1rem_black] 
          p-4 
          gap-4 
          backdrop-blur-md
          transition-all duration-500
          overflow-visible
          [transform-style:preserve-3d]
          [backface-visibility:hidden]
          ${className}
        `}
      >
        <div className="glow-card-blur pointer-events-none" />
        <div className="relative z-10 h-full w-full overflow-hidden rounded-[calc(var(--radius)*1px)]">
          {children}
        </div>
      </div>
    </>
  );
};

export { GlowCard };

