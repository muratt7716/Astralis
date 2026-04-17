"use client";

import React from "react";

interface PlanetIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function PlanetIcon({ name, className = "", size = 24 }: PlanetIconProps) {
  // Normalize name to lowercase for matching
  const planet = name.toLowerCase();

  // Color and SVG Path Mapping
  const planetData: Record<string, { color: string, path: React.ReactNode }> = {
    sun: {
      color: "#fbbf24", // Yellow-400
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </g>
      )
    },
    güneş: { color: "#fbbf24", path: null }, // Redirect in render
    moon: {
      color: "#94a3b8", // Slate-400
      path: (
        <path 
          d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.385 5.385 0 0 1-7.54-7.54c-.44-.06-.9-.1-1.36-.1z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      )
    },
    ay: { color: "#94a3b8", path: null },
    mercury: {
      color: "#9ca3af", // Gray-400
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="13" r="4" />
          <path d="M12 17v4M10 19h4" />
          <path d="M8 6c1.5-1 6.5-1 8 0" />
        </g>
      )
    },
    merkür: { color: "#9ca3af", path: null },
    venus: {
      color: "#f472b6", // Pink-400
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v7" />
          <path d="M9 18h6" />
        </g>
      )
    },
    venüs: { color: "#f472b6", path: null },
    mars: {
      color: "#f87171", // Red-400
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10" cy="14" r="5" />
          <path d="M14 10l6-6M21 3h-5M21 3v5" />
        </g>
      )
    },
    jupiter: {
      color: "#a78bfa", // Violet-400
      path: (
        <path 
          d="M10 5v14M7 15h6M8 5c-1 0-3 1-3 4s2 4 5 4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      )
    },
    jüpiter: { color: "#a78bfa", path: null },
    saturn: {
      color: "#818cf8", // Indigo-400
      path: (
        <path 
          d="M15 5c-2 0-4 2-4 5s1 4 4 4s4-2 4-5s-2-4-4-4z M11 10c0 4-2 8-6 8 M3 15h4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      )
    },
    satürn: { color: "#818cf8", path: null },
    uranus: {
      color: "#22d3ee", // Cyan-400
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="14" r="4" />
          <path d="M12 10V4M9 4h6M12 10l0 0" />
          <circle cx="12" cy="7" r="0.5" fill="currentColor" />
        </g>
      )
    },
    uranüs: { color: "#22d3ee", path: null },
    neptune: {
      color: "#60a5fa", // Blue-400
      path: (
        <path 
          d="M7 6v6c0 3 2 5 5 5s5-2 5-5V6 M12 6v14 M9 7h6" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      )
    },
    neptün: { color: "#60a5fa", path: null },
    pluto: {
      color: "#f43f5e", // Rose-500
      path: (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M7 14c0 3 2 5 5 5s5-2 5-5 M12 19v3M9 21h6" />
        </g>
      )
    },
    plüton: { color: "#f43f5e", path: null },
    ascendant: {
      color: "#fbbf24",
      path: <text x="4" y="16" fontSize="12" fontWeight="bold" fill="currentColor">AC</text>
    },
    mc: {
      color: "#fbbf24",
      path: <text x="4" y="16" fontSize="12" fontWeight="bold" fill="currentColor">MC</text>
    }
  };

  // Find the right data (handling Turkish names too)
  let activeData = planetData[planet];
  if (!activeData && (planet === "güneş" || planet === "gunes")) activeData = planetData.sun;
  if (!activeData && (planet === "ay" || planet === "moon")) activeData = planetData.moon;
  if (!activeData && (planet === "merkür" || planet === "merkur")) activeData = planetData.mercury;
  if (!activeData && (planet === "venüs" || planet === "venus")) activeData = planetData.venus;
  if (!activeData && (planet === "jüpiter" || planet === "jupiter")) activeData = planetData.jupiter;
  if (!activeData && (planet === "satürn" || planet === "saturn")) activeData = planetData.saturn;
  if (!activeData && (planet === "uranüs" || planet === "uranus")) activeData = planetData.uranus;
  if (!activeData && (planet === "neptün" || planet === "neptun" || planet === "neptune")) activeData = planetData.neptune;
  if (!activeData && (planet === "plüton" || planet === "pluton" || planet === "pluto")) activeData = planetData.pluto;

  if (!activeData) {
    // Fallback to a generic star if name not found
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ color: "white" }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={`transition-all duration-300 ${className}`}
      style={{ color: activeData.color }}
    >
      {activeData.path || planetData[planet === "güneş" ? "sun" : planet === "ay" ? "moon" : planet]?.path}
    </svg>
  );
}
