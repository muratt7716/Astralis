"use client";

/**
 * SVG Card Components — Sharp, vector-based card designs.
 * Replaces blurry PNG card backs with crisp inline SVGs.
 */

// ═══════════════════════════════════════
// CARD BACKS (face-down)
// ═══════════════════════════════════════

export function TarotCardBack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tarot-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0533" />
          <stop offset="100%" stopColor="#0d0118" />
        </linearGradient>
        <linearGradient id="tarot-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4c542" />
          <stop offset="50%" stopColor="#e8a317" />
          <stop offset="100%" stopColor="#f4c542" />
        </linearGradient>
      </defs>
      <rect width="120" height="180" rx="8" fill="url(#tarot-bg)" />
      <rect x="4" y="4" width="112" height="172" rx="6" fill="none" stroke="url(#tarot-gold)" strokeWidth="1.5" />
      <rect x="10" y="10" width="100" height="160" rx="4" fill="none" stroke="url(#tarot-gold)" strokeWidth="0.5" opacity="0.5" />
      {/* Sacred geometry */}
      <circle cx="60" cy="90" r="30" fill="none" stroke="url(#tarot-gold)" strokeWidth="0.8" opacity="0.6" />
      <circle cx="60" cy="90" r="20" fill="none" stroke="url(#tarot-gold)" strokeWidth="0.5" opacity="0.4" />
      {/* Eye of providence */}
      <path d="M60 75 Q75 90 60 105 Q45 90 60 75Z" fill="none" stroke="url(#tarot-gold)" strokeWidth="1" opacity="0.7" />
      <circle cx="60" cy="90" r="4" fill="url(#tarot-gold)" opacity="0.8" />
      {/* Stars */}
      <circle cx="30" cy="30" r="1.5" fill="#f4c542" opacity="0.6" />
      <circle cx="90" cy="30" r="1.5" fill="#f4c542" opacity="0.6" />
      <circle cx="30" cy="150" r="1.5" fill="#f4c542" opacity="0.6" />
      <circle cx="90" cy="150" r="1.5" fill="#f4c542" opacity="0.6" />
      <circle cx="60" cy="25" r="1" fill="#f4c542" opacity="0.4" />
      <circle cx="60" cy="155" r="1" fill="#f4c542" opacity="0.4" />
      {/* Corner ornaments */}
      <path d="M15 15 L25 15 L15 25Z" fill="url(#tarot-gold)" opacity="0.3" />
      <path d="M105 15 L95 15 L105 25Z" fill="url(#tarot-gold)" opacity="0.3" />
      <path d="M15 165 L25 165 L15 155Z" fill="url(#tarot-gold)" opacity="0.3" />
      <path d="M105 165 L95 165 L105 155Z" fill="url(#tarot-gold)" opacity="0.3" />
      {/* Moon and sun symbols */}
      <path d="M55 45 A8 8 0 1 1 55 55 A5 5 0 1 0 55 45Z" fill="url(#tarot-gold)" opacity="0.4" />
      <circle cx="65" cy="135" r="6" fill="none" stroke="url(#tarot-gold)" strokeWidth="0.8" opacity="0.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a} x1={65 + 8 * Math.cos(a * Math.PI / 180)} y1={135 + 8 * Math.sin(a * Math.PI / 180)}
              x2={65 + 10 * Math.cos(a * Math.PI / 180)} y2={135 + 10 * Math.sin(a * Math.PI / 180)}
              stroke="url(#tarot-gold)" strokeWidth="0.5" opacity="0.4" />
      ))}
    </svg>
  );
}

export function KatinaCardBack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="katina-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d0a1a" />
          <stop offset="100%" stopColor="#1a0510" />
        </linearGradient>
        <linearGradient id="katina-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8a0b4" />
          <stop offset="50%" stopColor="#d4728c" />
          <stop offset="100%" stopColor="#e8a0b4" />
        </linearGradient>
      </defs>
      <rect width="120" height="180" rx="8" fill="url(#katina-bg)" />
      <rect x="4" y="4" width="112" height="172" rx="6" fill="none" stroke="url(#katina-gold)" strokeWidth="1.5" />
      <rect x="10" y="10" width="100" height="160" rx="4" fill="none" stroke="url(#katina-gold)" strokeWidth="0.5" opacity="0.5" />
      {/* Crescent & Star (Ottoman) */}
      <path d="M55 80 A15 15 0 1 1 55 100 A10 10 0 1 0 55 80Z" fill="url(#katina-gold)" opacity="0.5" />
      <polygon points="75,85 77,91 83,91 78,95 80,101 75,97 70,101 72,95 67,91 73,91" fill="url(#katina-gold)" opacity="0.5" />
      {/* Tulip motifs */}
      <path d="M30 50 Q35 40 40 50 Q35 55 30 50Z" fill="url(#katina-gold)" opacity="0.3" />
      <path d="M80 50 Q85 40 90 50 Q85 55 80 50Z" fill="url(#katina-gold)" opacity="0.3" />
      <path d="M30 130 Q35 120 40 130 Q35 135 30 130Z" fill="url(#katina-gold)" opacity="0.3" />
      <path d="M80 130 Q85 120 90 130 Q85 135 80 130Z" fill="url(#katina-gold)" opacity="0.3" />
      {/* Decorative dots */}
      {[20, 40, 60, 80, 100].map(x => (
        <g key={x}>
          <circle cx={x} cy="18" r="1" fill="url(#katina-gold)" opacity="0.4" />
          <circle cx={x} cy="162" r="1" fill="url(#katina-gold)" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

export function LenormandCardBack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lenormand-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1500" />
          <stop offset="100%" stopColor="#150a00" />
        </linearGradient>
        <linearGradient id="lenormand-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a44a" />
          <stop offset="50%" stopColor="#c48820" />
          <stop offset="100%" stopColor="#d4a44a" />
        </linearGradient>
      </defs>
      <rect width="120" height="180" rx="8" fill="url(#lenormand-bg)" />
      <rect x="4" y="4" width="112" height="172" rx="6" fill="none" stroke="url(#lenormand-gold)" strokeWidth="1.5" />
      <rect x="10" y="10" width="100" height="160" rx="4" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.5" opacity="0.5" />
      {/* Fleur-de-lis */}
      <path d="M60 70 Q60 60 55 55 Q60 60 60 50 Q60 60 65 55 Q60 60 60 70Z" fill="url(#lenormand-gold)" opacity="0.6" />
      <path d="M52 72 Q50 68 46 70 Q52 70 52 72Z" fill="url(#lenormand-gold)" opacity="0.6" />
      <path d="M68 72 Q70 68 74 70 Q68 70 68 72Z" fill="url(#lenormand-gold)" opacity="0.6" />
      <rect x="57" y="72" width="6" height="16" rx="1" fill="url(#lenormand-gold)" opacity="0.5" />
      {/* Compass rose */}
      <circle cx="60" cy="110" r="12" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.6" opacity="0.4" />
      <line x1="60" y1="96" x2="60" y2="124" stroke="url(#lenormand-gold)" strokeWidth="0.5" opacity="0.3" />
      <line x1="46" y1="110" x2="74" y2="110" stroke="url(#lenormand-gold)" strokeWidth="0.5" opacity="0.3" />
      <polygon points="60,97 62,108 58,108" fill="url(#lenormand-gold)" opacity="0.5" />
      {/* Corner roses */}
      <circle cx="22" cy="22" r="5" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.8" opacity="0.3" />
      <circle cx="98" cy="22" r="5" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.8" opacity="0.3" />
      <circle cx="22" cy="158" r="5" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.8" opacity="0.3" />
      <circle cx="98" cy="158" r="5" fill="none" stroke="url(#lenormand-gold)" strokeWidth="0.8" opacity="0.3" />
      <circle cx="22" cy="22" r="2" fill="url(#lenormand-gold)" opacity="0.2" />
      <circle cx="98" cy="22" r="2" fill="url(#lenormand-gold)" opacity="0.2" />
      <circle cx="22" cy="158" r="2" fill="url(#lenormand-gold)" opacity="0.2" />
      <circle cx="98" cy="158" r="2" fill="url(#lenormand-gold)" opacity="0.2" />
    </svg>
  );
}


// ═══════════════════════════════════════
// CARD FACES (face-up, for Katina & Lenormand)
// ═══════════════════════════════════════

const themeColors: Record<string, { bg: string; accent: string; border: string }> = {
  aşk:        { bg: "#2a0015", accent: "#ff4d6d", border: "#ff4d6d" },
  aile:       { bg: "#0a1a2a", accent: "#4da6ff", border: "#4da6ff" },
  şans:       { bg: "#1a1a00", accent: "#ffd700", border: "#ffd700" },
  sezgi:      { bg: "#0a002a", accent: "#a855f7", border: "#a855f7" },
  fırsat:     { bg: "#001a0a", accent: "#22c55e", border: "#22c55e" },
  iletişim:   { bg: "#1a0a00", accent: "#f97316", border: "#f97316" },
  mutluluk:   { bg: "#2a001a", accent: "#ec4899", border: "#ec4899" },
  dostluk:    { bg: "#001a1a", accent: "#14b8a6", border: "#14b8a6" },
  kariyer:    { bg: "#1a1a1a", accent: "#94a3b8", border: "#94a3b8" },
  yolculuk:   { bg: "#001a2a", accent: "#38bdf8", border: "#38bdf8" },
  uyarı:      { bg: "#2a0a00", accent: "#ef4444", border: "#ef4444" },
  güç:        { bg: "#1a0a00", accent: "#d97706", border: "#d97706" },
  değişim:    { bg: "#0a1a0a", accent: "#10b981", border: "#10b981" },
  istikrar:   { bg: "#0a0a1a", accent: "#6366f1", border: "#6366f1" },
  zorluk:     { bg: "#1a0a0a", accent: "#b91c1c", border: "#b91c1c" },
  karar:      { bg: "#1a1a0a", accent: "#ca8a04", border: "#ca8a04" },
  bilgi:      { bg: "#0a0a2a", accent: "#818cf8", border: "#818cf8" },
  kader:      { bg: "#1a001a", accent: "#c084fc", border: "#c084fc" },
  finans:     { bg: "#001a00", accent: "#16a34a", border: "#16a34a" },
  belirsizlik:{ bg: "#0a0a0a", accent: "#64748b", border: "#64748b" },
  başlangıç:  { bg: "#0a1a1a", accent: "#2dd4bf", border: "#2dd4bf" },
  kişi:       { bg: "#1a0a1a", accent: "#d946ef", border: "#d946ef" },
  huzur:      { bg: "#0a0a1a", accent: "#a78bfa", border: "#a78bfa" },
};

const defaultTheme = { bg: "#1a1a2a", accent: "#a78bfa", border: "#a78bfa" };

export function KatinaCardFace({ name, theme, id, className = "" }: {
  name: string; theme: string; id: number; className?: string;
}) {
  const colors = themeColors[theme] || defaultTheme;
  
  // Seeded abstract geometry based on ID to ensure EVERY card looks distinct
  const seed = id * 137.5;
  const numRings = 3 + (id % 3);
  
  return (
    <svg viewBox="0 0 120 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`katina-bg-${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={colors.bg} stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0508" stopOpacity="1" />
        </radialGradient>
        <linearGradient id={`katina-gold-trim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors.accent} />
          <stop offset="50%" stopColor="#ffebbe" />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
      </defs>

      {/* Deep gradient background */}
      <rect width="120" height="180" rx="8" fill={`url(#katina-bg-${id})`} />
      
      {/* Intricate seeded geometry (mandala/crest background) */}
      <g opacity="0.15" transform={`translate(60, 90) rotate(${seed % 360})`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse 
            key={i} 
            cx="0" cy="0" 
            rx={20 + (id % 15)} ry={40 + (id % 20)} 
            fill="none" 
            stroke={colors.accent} 
            strokeWidth="0.5" 
            transform={`rotate(${(i * 45) + (seed % 15)})`} 
          />
        ))}
        {Array.from({ length: numRings }).map((_, i) => (
          <circle key={i} cx="0" cy="0" r={15 + i * 12} fill="none" stroke={colors.accent} strokeDasharray={`${3 + (id%4)} ${2 + (id%3)}`} strokeWidth="0.5" />
        ))}
      </g>

      {/* Ornate Double Borders */}
      <rect x="4" y="4" width="112" height="172" rx="6" fill="none" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="1" />
      <rect x="8" y="8" width="104" height="164" rx="4" fill="none" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="0.5" opacity="0.6" />
      <rect x="12" y="12" width="96" height="156" rx="2" fill="none" stroke={colors.accent} strokeWidth="0.3" opacity="0.3" />

      {/* Corner Filigree */}
      {[
        [12, 12, 1], [108, 12, -1], [12, 168, 1], [108, 168, -1]
      ].map(([x, y, scaleX], i) => (
        <g key={i} transform={`translate(${x}, ${y}) scale(${scaleX}, ${y > 90 ? -1 : 1})`} fill="none" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="0.5">
          <path d="M0 0 C 10 0, 15 5, 15 15 C 10 10, 5 10, 0 0Z" fill={`${colors.accent}22`} />
          <circle cx="2" cy="2" r="1.5" fill={`url(#katina-gold-trim-${id})`} />
        </g>
      ))}

      {/* Element Symbol (Top & Bottom Center) */}
      <circle cx="60" cy="18" r="6" fill="#000" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="0.5" />
      <circle cx="60" cy="162" r="6" fill="#000" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="0.5" />
      <text x="60" y="21" fill={colors.accent} fontSize="8" fontFamily="serif" textAnchor="middle" fontStyle="italic">{id}</text>
      <text x="60" y="165" fill={colors.accent} fontSize="8" fontFamily="serif" textAnchor="middle" fontStyle="italic">{id}</text>

      {/* Central Plaque - Ottoman/Baroque inspired */}
      <g transform="translate(60, 90)">
        <polygon points="0,-25 46,-15 52,0 46,15 0,25 -46,15 -52,0 -46,-15" fill="#0f050a" stroke={`url(#katina-gold-trim-${id})`} strokeWidth="1" />
        <polygon points="0,-21 42,-12 48,0 42,12 0,21 -42,12 -48,0 -42,-12" fill="none" stroke={colors.accent} strokeWidth="0.4" opacity="0.5" />
        
        {/* The Card Name (Smart Line Break for long names) */}
        {name.includes(' ') && name.length > 10 ? (
          <>
            <text y="-2" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.5">
              {name.split(' ')[0].toUpperCase()}
            </text>
            <text y="8" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.5">
              {name.split(' ').slice(1).join(' ').toUpperCase()}
            </text>
          </>
        ) : (
          <text y="3" fill="#ffffff" fontSize={name.length > 10 ? "8" : "11"} fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.5">
            {name.toUpperCase()}
          </text>
        )}
        <text y={name.includes(' ') && name.length > 10 ? "17" : "14"} fill={colors.accent} fontSize="5" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1" opacity="0.8">
          - {theme.toUpperCase()} -
        </text>
      </g>
    </svg>
  );
}

export function LenormandCardFace({ name, id, className = "" }: {
  name: string; id: number; className?: string;
}) {
  const seed = id * 42.7;
  const suitColor = '#1a1a1a';
  
  return (
    <svg viewBox="0 0 120 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Antique parchment paper effect */}
        <radialGradient id={`len-face-${id}`} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#fdf6e3" />
          <stop offset="70%" stopColor="#ebd7b2" />
          <stop offset="100%" stopColor="#dcb888" />
        </radialGradient>
        {/* Subtle noise pattern grid */}
        <pattern id={`noise-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0M1 5L5 1M-1 3L3 -1" stroke="#8b6914" strokeWidth="0.2" opacity="0.15" />
        </pattern>
      </defs>

      {/* Backgrounds */}
      <rect width="120" height="180" rx="6" fill={`url(#len-face-${id})`} />
      <rect width="120" height="180" fill={`url(#noise-${id})`} />

      {/* Classic etched double border */}
      <rect x="4" y="4" width="112" height="172" rx="4" fill="none" stroke="#5a3e0a" strokeWidth="1" />
      <rect x="6" y="6" width="108" height="168" rx="2" fill="none" stroke="#8b6914" strokeWidth="0.5" />
      
      {/* Corner corner-blocks (Victorian style) */}
      {[
        [4,4], [108,4], [4,168], [108,168]
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="8" fill="#5a3e0a" />
      ))}
      {[
        [6,6], [110,6], [6,170], [110,170]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#fdf6e3" />
      ))}

      {/* Top Center: Card Number Plate */}
      <g transform="translate(60, 20)">
        <circle cx="0" cy="0" r="10" fill="#5a3e0a" />
        <circle cx="0" cy="0" r="9" fill="none" stroke="#dcb888" strokeWidth="0.5" />
        <text x="0" y="3.5" fill="#fdf6e3" fontSize="11" fontWeight="bold" fontFamily="serif" textAnchor="middle">{id}</text>
      </g>

      {/* Center Art - Procedural Victorian Line Art Engraving */}
      <g transform="translate(60, 90)" stroke="#5a3e0a" fill="none">
        <circle cx="0" cy="0" r="35" strokeWidth="0.5" opacity="0.4" />
        <circle cx="0" cy="0" r="33" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.5" />
        
        {/* Generating a stylized star/flower that varies by ID */}
        <g strokeWidth="0.6">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30);
            const r1 = 5 + (seed % 10);
            const r2 = 15 + ((seed * 2) % 15);
            const r3 = 25 + ((seed * 3) % 10);
            return (
              <path key={i} d={`M 0 0 C ${r1} -${r2}, ${r2} -${r1}, 0 -${r3}`} transform={`rotate(${angle})`} fill={`${suitColor}11`} />
            );
          })}
        </g>
        
        {/* Central emblem */}
        <polygon points="0,-8 6,0 0,8 -6,0" fill="#5a3e0a" />
        <circle cx="0" cy="0" r="2" fill="#ebd7b2" />
      </g>

      {/* Bottom Banner for Name */}
      <g transform="translate(60, 155)">
        <path d="M-45 -10 L45 -10 L50 0 L45 10 L-45 10 L-50 0 Z" fill="#fdf6e3" stroke="#5a3e0a" strokeWidth="0.8" />
        <path d="M-44 -8 L44 -8 L48 0 L44 8 L-44 8 L-48 0 Z" fill="none" stroke="#8b6914" strokeWidth="0.4" />
        <text y="4" fill="#3d2400" fontSize={name.length > 10 ? "9" : "11"} fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.5">
          {name.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}
