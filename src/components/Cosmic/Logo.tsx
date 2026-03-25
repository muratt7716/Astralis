"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full animate-pulse" />
      
      {/* The Orb / Crystal Ball */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
      >
        <defs>
          <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <filter id="innerGlow">
            <feFlood floodColor="white" floodOpacity="0.5" result="flood" />
            <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
            <feGaussianBlur in="mask" stdDeviation="2" result="blur" />
            <feOffset dx="0" dy="0" />
            <feComposite in2="SourceGraphic" operator="arithmetic" k2="-1" k3="1" result="shadow" />
          </filter>
        </defs>

        {/* Main Sphere */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="url(#orbGradient)"
          fillOpacity="0.9"
          className="animate-pulse"
        />
        
        {/* Inner highlights */}
        <circle cx="35" cy="35" r="15" fill="white" fillOpacity="0.15" filter="url(#innerGlow)" />
        
        {/* Celestial Rings */}
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="15"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          transform="rotate(-20 50 50)"
          className="animate-spin-slow"
          style={{ transformOrigin: "50px 50px", animationDuration: "10s" }}
        />
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="10"
          stroke="white"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          transform="rotate(40 50 50)"
          className="animate-spin-slow"
          style={{ transformOrigin: "50px 50px", animationDuration: "15s", animationDirection: "reverse" }}
        />

        {/* Central Star Sparkle */}
        <path
          d="M50 35L52 48L65 50L52 52L50 65L48 52L35 50L48 48L50 35Z"
          fill="white"
          fillOpacity="0.8"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
