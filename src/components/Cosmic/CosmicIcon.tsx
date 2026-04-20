"use client";
import React, { useId } from "react";

interface IconProps {
  name: "horoscope" | "birthchart" | "compatibility" | "planets" |
  "tarot" | "katina" | "lenormand" | "kahve" | "runler" | "iching" | "kristal" | "numerology" | "biorhythm" | "dream" | "horary" |
  "stars" | "fire" | "water" | "air" | "earth" | "planet" | "cardinal" | "fixed" | "mutable";
  className?: string;
  size?: number;
}

export default function CosmicIcon({ name, className = "", size = 32 }: IconProps) {
  const baseId = useId();
  const getSubId = (suffix: string) => `${baseId}-${suffix}`;

  const icons: Record<string, React.ReactNode> = {
    horoscope: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("sunGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id={getSubId("moonGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx="45" cy="45" r="20" fill={`url(#${getSubId("sunGrad")})`} />
        <path d="M45 15V22M45 68V75M15 45H22M68 45H75M23 23L28 28M62 62L67 67M23 67L28 62M62 23L67 28" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 45A25 25 0 1 0 85 75A20 20 0 1 1 55 45Z" fill={`url(#${getSubId("moonGrad")})`} />
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
          <radialGradient id={getSubId("crystalGrad")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="45" r="35" fill={`url(#${getSubId("crystalGrad")})`} />
        <circle cx="50" cy="45" r="35" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M30 85H70L60 75H40L30 85Z" fill="#374151" />
        <circle cx="50" cy="45" r="5" fill="white" fillOpacity="0.6">
          <animate attributeName="r" values="3;7;3" dur="3s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    numerology: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("numGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" stroke={`url(#${getSubId("numGrad")})`} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
        <path d="M50 10V90M10 50H90" stroke={`url(#${getSubId("numGrad")})`} strokeWidth="0.5" opacity="0.2" />
        <text x="50" y="65" fontSize="42" fontWeight="900" fill={`url(#${getSubId("numGrad")})`} textAnchor="middle" fontFamily="serif" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }}>
          7
        </text>
        <circle cx="20" cy="20" r="3" fill="#A855F7" />
        <circle cx="80" cy="20" r="3" fill="#F43F5E" />
        <circle cx="80" cy="80" r="3" fill="#EC4899" />
        <circle cx="20" cy="80" r="3" fill="#6366F1" />
        <path d="M20 20L80 20L80 80L20 80Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>
    ),
    biorhythm: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("bioGrad")} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <path d="M10 50C25 10 40 10 55 50C70 90 85 90 100 50" stroke={`url(#${getSubId("bioGrad")})`} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M0 50C15 90 30 90 45 50C60 10 75 10 90 50" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <circle cx="50" cy="50" r="6" fill="white" style={{ filter: 'drop-shadow(0 0 8px #06B6D4)' }} />
      </svg>
    ),
    dream: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("dreamGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <path d="M75 35A30 30 0 1 0 75 75A25 25 0 1 1 75 35Z" fill={`url(#${getSubId("dreamGrad")})`} />
        <circle cx="35" cy="40" r="2" fill="white" opacity="0.6" />
        <circle cx="50" cy="25" r="3" fill="white" opacity="0.4" />
        <path d="M25 75Q40 65 55 75T85 75" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="65" cy="55" r="1.5" fill="white" opacity="0.8">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    stars: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15L55 45L85 50L55 55L50 85L45 55L15 50L45 45L50 15Z" fill="currentColor" fillOpacity="0.8" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.4" />
        <circle cx="80" cy="80" r="2" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    fire: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("fireGrad")} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path d="M50 8C50 8 18 38 18 62C18 84 32 96 50 96C68 96 82 84 82 62C82 38 50 8 50 8Z" fill={`url(#${getSubId("fireGrad")})`} opacity="0.3" />
        <path d="M50 25C50 25 28 48 28 68C28 82 38 92 50 92C62 92 72 82 72 68C72 48 50 25 50 25Z" fill={`url(#${getSubId("fireGrad")})`} opacity="0.7" />
        <path d="M50 45C50 45 38 58 38 72C38 82 44 88 50 88C56 88 62 82 62 72C62 58 50 45 50 45Z" fill="#FBBF24" />
        <circle cx="50" cy="72" r="4" fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    water: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("waterGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <path d="M50 10C50 10 20 40 20 62C20 80 33 92 50 92C67 92 80 80 80 62C80 40 50 10 50 10Z" fill={`url(#${getSubId("waterGrad")})`} opacity="0.25" />
        <path d="M50 22C50 22 28 46 28 64C28 78 38 88 50 88C62 88 72 78 72 64C72 46 50 22 50 22Z" fill={`url(#${getSubId("waterGrad")})`} opacity="0.6" />
        <path d="M50 38C50 38 36 54 36 66C36 76 42 82 50 82C58 82 64 76 64 66C64 54 50 38 50 38Z" fill="#93C5FD" opacity="0.8" />
        <ellipse cx="44" cy="62" rx="4" ry="2" fill="white" opacity="0.4" transform="rotate(-20 44 62)" />
      </svg>
    ),
    air: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("airGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
        <path d="M12 35C12 35 35 18 60 35C75 45 88 30 88 30" stroke={`url(#${getSubId("airGrad")})`} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M8 52C8 52 28 38 50 52C68 62 85 48 85 48" stroke={`url(#${getSubId("airGrad")})`} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M15 68C15 68 38 55 58 68C72 77 82 65 82 65" stroke={`url(#${getSubId("airGrad")})`} strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        <circle cx="72" cy="25" r="3" fill="#06B6D4" opacity="0.6">
          <animate attributeName="cx" values="72;78;72" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="25" cy="45" r="2" fill="#94A3B8" opacity="0.4">
          <animate attributeName="cx" values="25;18;25" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    earth: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("earthGrad")} x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path d="M50 15L80 85H20L50 15Z" fill={`url(#${getSubId("earthGrad")})`} opacity="0.2" />
        <path d="M50 30L72 80H28L50 30Z" fill={`url(#${getSubId("earthGrad")})`} opacity="0.5" />
        <path d="M50 48L62 75H38L50 48Z" fill="#34D399" opacity="0.8" />
        <path d="M15 85H85" stroke="#10B981" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="50" cy="60" r="3" fill="white" opacity="0.5" />
        <path d="M35 75L42 68M58 75L65 68" stroke="white" strokeWidth="1" opacity="0.2" />
      </svg>
    ),
    cardinal: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("cardGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="38" stroke={`url(#${getSubId("cardGrad")})`} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
        <path d="M50 12L56 44H50L50 12Z" fill="#A855F7" />
        <path d="M50 88L44 56H50L50 88Z" fill="#A855F7" opacity="0.6" />
        <path d="M12 50L44 44V50L12 50Z" fill="#EC4899" />
        <path d="M88 50L56 56V50L88 50Z" fill="#EC4899" opacity="0.6" />
        <circle cx="50" cy="50" r="6" fill={`url(#${getSubId("cardGrad")})`} />
        <circle cx="50" cy="50" r="3" fill="white" opacity="0.8" />
      </svg>
    ),
    fixed: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("fixGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M50 15L75 50L50 85L25 50Z" fill={`url(#${getSubId("fixGrad")})`} opacity="0.3" />
        <path d="M50 15L75 50L50 85L25 50Z" stroke={`url(#${getSubId("fixGrad")})`} strokeWidth="2.5" />
        <path d="M50 30L65 50L50 70L35 50Z" fill={`url(#${getSubId("fixGrad")})`} opacity="0.6" />
        <circle cx="50" cy="50" r="5" fill="white" opacity="0.9" />
        <path d="M50 15V30M50 70V85M25 50H35M65 50H75" stroke="white" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
    mutable: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("mutGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <path d="M15 50C15 35 30 25 45 35C55 42 60 42 70 35C85 25 95 45 75 55C65 60 60 65 65 75C70 90 50 95 45 80C40 70 30 65 20 70C5 78 5 60 15 50Z" fill={`url(#${getSubId("mutGrad")})`} opacity="0.25" />
        <path d="M15 50C15 35 30 25 45 35C55 42 60 42 70 35C85 25 95 45 75 55C65 60 60 65 65 75C70 90 50 95 45 80C40 70 30 65 20 70C5 78 5 60 15 50Z" stroke={`url(#${getSubId("mutGrad")})`} strokeWidth="2" />
        <circle cx="45" cy="40" r="3" fill="#06B6D4" opacity="0.8" />
        <circle cx="65" cy="55" r="3" fill="#8B5CF6" opacity="0.8" />
        <circle cx="40" cy="70" r="3" fill="#06B6D4" opacity="0.8" />
      </svg>
    ),
    planet: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4" />
        <ellipse cx="50" cy="50" rx="45" ry="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" transform="rotate(-15 50 50)" />
      </svg>
    ),
    horary: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={getSubId("horaryGrad")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        {/* Outer wheel */}
        <circle cx="50" cy="50" r="44" stroke={`url(#${getSubId("horaryGrad")})`} strokeWidth="1.5" strokeDasharray="3 5" opacity="0.5" />
        {/* Inner wheel */}
        <circle cx="50" cy="50" r="30" stroke={`url(#${getSubId("horaryGrad")})`} strokeWidth="1" opacity="0.4" />
        {/* Cross hairs */}
        <path d="M50 6V22M50 78V94M6 50H22M78 50H94" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {/* Hour hand */}
        <path d="M50 50L50 20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        {/* Minute hand */}
        <path d="M50 50L70 38" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill={`url(#${getSubId("horaryGrad")})`} />
        {/* Stars */}
        <circle cx="50" cy="16" r="2" fill="#F59E0B" opacity="0.8" />
        <circle cx="74" cy="26" r="1.5" fill="#A855F7" opacity="0.6" />
      </svg>
    ),
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div className={`absolute inset-0 blur-xl opacity-20 rounded-full animate-pulse ${["horoscope", "birthchart", "tarot", "kristal", "dream"].includes(name) ? "bg-purple-500" :
          ["compatibility", "katina", "numerology"].includes(name) ? "bg-pink-500" :
            ["kahve", "lenormand"].includes(name) ? "bg-amber-500" :
              ["runler", "planets", "biorhythm"].includes(name) ? "bg-blue-500" : "bg-emerald-500"
        }`} />

      <div className="relative z-10 w-full h-full">
        {icons[name] || icons.horoscope}
      </div>
    </div>
  );
}
