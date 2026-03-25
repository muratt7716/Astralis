"use client";

import React from "react";

interface IconProps {
  name: "horoscope" | "birthchart" | "compatibility" | "planets" | 
        "tarot" | "katina" | "lenormand" | "kahve" | "runler" | "iching" | "kristal";
  className?: string;
  size?: number;
}

export default function CosmicIcon({ name, className = "", size = 32 }: IconProps) {
  const icons: Record<string, React.ReactNode> = {
    horoscope: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx="45" cy="45" r="20" fill="url(#sunGrad)" />
        <path d="M45 15V22M45 68V75M15 45H22M68 45H75M23 23L28 28M62 62L67 67M23 67L28 62M62 23L67 28" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 45A25 25 0 1 0 85 75A20 20 0 1 1 55 45Z" fill="url(#moonGrad)" />
      </svg>
    ),
    birthchart: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <path d="M50 15L55 50L50 85L45 50L50 15Z" fill="#F59E0B" />
        <circle cx="50" cy="50" r="4" fill="white" />
        <path d="M10 50H20M80 50H90M50 10V20M50 80V90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="25" cy="25" r="2" fill="#A855F7" />
        <circle cx="75" cy="75" r="3" fill="#EC4899" />
      </svg>
    ),
    compatibility: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 40C30 30 50 30 50 50C50 30 70 30 70 40C70 60 50 80 50 80C50 80 30 60 30 40Z" fill="#EC4899" fillOpacity="0.8" />
        <path d="M45 45C45 35 65 35 65 55C65 35 85 35 85 45C85 65 65 85 65 85C65 85 45 65 45 45Z" fill="#A855F7" fillOpacity="0.6" />
        <path d="M15 25L17 30L22 32L17 34L15 39L13 34L8 32L13 30L15 25Z" fill="#F59E0B" />
      </svg>
    ),
    planets: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="15" fill="#6366F1" />
        <ellipse cx="50" cy="50" rx="40" ry="12" stroke="white" strokeWidth="2" strokeOpacity="0.4" transform="rotate(-20 50 50)" />
        <circle cx="80" cy="35" r="4" fill="#A855F7" />
        <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>
    ),
    tarot: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="15" width="40" height="60" rx="4" fill="#1E1E3F" stroke="#A855F7" strokeWidth="2" />
        <rect x="35" y="25" width="40" height="60" rx="4" fill="#2E2E5F" stroke="#EC4899" strokeWidth="2" transform="rotate(10 35 25)" />
        <path d="M55 45L65 55M55 55L65 45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" transform="rotate(10 35 25)" />
        <circle cx="60" cy="55" r="8" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" transform="rotate(10 35 25)" />
      </svg>
    ),
    katina: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20C50 20 30 40 30 60C30 80 50 90 50 90C50 90 70 80 70 60C70 40 50 20Z" fill="#F43F5E" fillOpacity="0.3" />
        <path d="M50 30C50 30 40 45 40 60C40 75 50 80 50 80C50 80 60 75 60 60C60 45 50 30Z" fill="#F43F5E" />
        <circle cx="50" cy="60" r="5" fill="#FBBF24" />
        <path d="M25 50Q50 20 75 50M25 70Q50 40 75 70" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    ),
    lenormand: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15V85M30 35H70M50 15L30 35M50 15L70 35" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M35 70L50 85L65 70" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    kahve: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 40H75C75 40 75 70 50 70C25 70 25 40 25 40Z" fill="#78350F" />
        <path d="M75 45C85 45 85 60 75 60" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 75H80" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
        {/* Steam */}
        <path d="M40 30Q45 20 40 10M50 35Q55 25 50 15M60 30Q65 20 60 10" stroke="white" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
      </svg>
    ),
    runler: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 20Q50 10 70 20L80 50Q85 80 50 90Q15 80 20 50Z" fill="#4B5563" stroke="#9CA3AF" strokeWidth="2" />
        <path d="M40 30V70M40 50L60 30M40 50L60 70" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
      </svg>
    ),
    iching: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M50 10A40 40 0 0 1 50 90A20 20 0 0 1 50 50A20 20 0 0 0 50 10Z" fill="white" />
        <path d="M50 10A40 40 0 0 0 50 90A20 20 0 0 0 50 50A20 20 0 0 1 50 10Z" fill="#111827" />
        <circle cx="50" cy="30" r="5" fill="#111827" />
        <circle cx="50" cy="70" r="5" fill="white" />
      </svg>
    ),
    kristal: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="crystalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="45" r="35" fill="url(#crystalGrad)" />
        <circle cx="50" cy="45" r="35" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M30 85H70L60 75H40L30 85Z" fill="#374151" />
        {/* Glow */}
        <circle cx="50" cy="45" r="5" fill="white" fillOpacity="0.6">
          <animate attributeName="r" values="3;7;3" dur="3s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Background glow per icon type */}
      <div className={`absolute inset-0 blur-xl opacity-20 rounded-full animate-pulse ${
        ["horoscope", "birthchart", "tarot", "kristal"].includes(name) ? "bg-purple-500" :
        ["compatibility", "katina"].includes(name) ? "bg-pink-500" :
        ["kahve", "lenormand"].includes(name) ? "bg-amber-500" :
        ["runler", "planets"].includes(name) ? "bg-blue-500" : "bg-emerald-500"
      }`} />
      
      <div className="relative z-10 w-full h-full">
        {icons[name] || icons.horoscope}
      </div>
    </div>
  );
}
