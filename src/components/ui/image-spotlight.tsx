'use client'
import React, { useState, useCallback, useRef } from 'react';

// Types
interface PerspectiveState {
  rotateX: number;
  rotateY: number;
}

interface SpotlightConfig {
  spotlightSize?: number;
  overlayOpacity?: number;
  className?: string;
}

interface ImageSpotlightProps {
  src: string;
  alt: string;
  orientation?: 'landscape' | 'portrait';
  width?: number | string;
  height?: number | string;
  config?: SpotlightConfig;
  children?: React.ReactNode;
}


export default function ImageSpotlight({
  src,
  alt,
  orientation = 'landscape',
  width,
  height,
  config = {},
  children
}: ImageSpotlightProps) {
  // Default configuration
  const defaultConfig: Required<SpotlightConfig> = {
    spotlightSize: 120,
    overlayOpacity: 0.8,
    className: ''
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Component state
  const [perspective, setPerspective] = useState<PerspectiveState>({ rotateX: 0, rotateY: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move handler
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Update CSS variables for spotlight position
    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);

    // Calculate 3D perspective rotation
    const rotateY = ((x - 50) / 50) * 8; // Left-right tilt
    const rotateX = ((50 - y) / 50) * 8; // Up-down tilt

    setPerspective({ rotateX, rotateY });
  }, []);

  // Mouse enter handler
  const handleMouseEnter = () => {
    // Handler for mouse enter event
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    setPerspective({ rotateX: 0, rotateY: 0 }); // Reset perspective when leaving
  };

  // Container classes and inline styles
  const getContainerDimensions = (): React.CSSProperties => {
    if (width && height) {
      return {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: '100%'
      };
    }

    if (orientation === 'landscape') {
      return {
        width: '800px',
        height: '450px',
        maxWidth: '100%'
      };
    } else {
      return {
        width: '450px',
        height: '600px',
        maxWidth: '100%'
      };
    }
  };

  const containerClasses = `
    relative overflow-hidden cursor-crosshair rounded-[2.5rem] shadow-2xl border border-white/10
    ${finalConfig.className}
  `.trim();

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        ref={containerRef}
        className={containerClasses}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label={alt}
        style={{
          ...getContainerDimensions(),
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-size': `${finalConfig.spotlightSize}px`,
          '--overlay-opacity': finalConfig.overlayOpacity,
          transform: `perspective(1000px) rotateX(${perspective.rotateX}deg) rotateY(${perspective.rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease-out',
          backgroundColor: '#000'
        } as React.CSSProperties}
      >
        {/* Blurred Base Image */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          draggable={false}
          style={{ filter: 'blur(15px)' }}
        />

        {/* Sharp Image - Only visible through spotlight */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          style={{
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.4}px,
              transparent ${finalConfig.spotlightSize * 1.8}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.4}px,
              transparent ${finalConfig.spotlightSize * 1.8}px
            )`,
            zIndex: 2
          }}
        />

        {/* Main Dark Overlay */}
        <div
          className="absolute inset-0 bg-black/80 pointer-events-none"
          style={{
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.4}px,
              black ${finalConfig.spotlightSize * 1.8}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.4}px,
              black ${finalConfig.spotlightSize * 1.8}px
            )`,
            zIndex: 10
          }}
        />

        {/* Children (Overlays, text, etc) */}
        <div className="relative z-20 w-full h-full">
           {children}
        </div>
      </div>
    </div>
  );
}
