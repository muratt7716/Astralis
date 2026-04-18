import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import React from "react";

export const GUIDES = [
  {
    id: "melisa", name: "Melisa", image: "/avatars/melisa.png", role: "Mistik Melisa",
    bio: "Hayatın her alanındaki olaylara kalbinin gözüyle bakar. Şefkat ve derin bir empatiyle yaklaşır.",
    traits: ["Empatik", "Şefkatli", "Duygusal Zeka"],
    gradient: "from-rose-500/20 to-pink-500/20", accent: "text-rose-400", glow: "rgba(244,63,94,0.3)",
    borderAccent: "border-rose-500/30", bgAccent: "bg-rose-500/10",
    imageActive: "/avatars/melisa.png"
  },
  {
    id: "aras", name: "Aras", image: "/avatars/aras.png", role: "Astrolog Aras",
    bio: "Karmaşık durumları keskin mantık süzgecinden geçirir. Net ve stratejik tavsiyeler verir.",
    traits: ["Rasyonel", "Net", "Stratejik"],
    gradient: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", glow: "rgba(59,130,246,0.3)",
    borderAccent: "border-blue-500/30", bgAccent: "bg-blue-500/10",
    imageActive: "/avatars/aras.png"
  },
  {
    id: "umut", name: "Umut", image: "/avatars/umut.png", role: "Şaman Umut",
    bio: "En dürüst aynayı tutan modern bir dost. Esprileriyle dağıtır, gerçekleri yüzünüze çarpar.",
    traits: ["Dürüst", "Esprili", "Samimi"],
    gradient: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400", glow: "rgba(245,158,11,0.3)",
    borderAccent: "border-amber-500/30", bgAccent: "bg-amber-500/10",
    imageActive: "/avatars/umut.png"
  },
  {
    id: "hekate", name: "Hekate", image: "/avatars/hekate.png", role: "Gizemli Hekate",
    bio: "Kadim sembollerin ve ruhsal şifanın derin bilgisine sahip. Bin yıllık bilgelikle yaklaşır.",
    traits: ["Mistik", "Bilge", "Gözlemci"],
    gradient: "from-violet-500/20 to-purple-500/20", accent: "text-violet-400", glow: "rgba(139,92,246,0.3)",
    borderAccent: "border-violet-500/30", bgAccent: "bg-violet-500/10",
    imageActive: "/avatars/hekate.png"
  },
  {
    id: "selin", name: "Selin", image: "/avatars/selin.png", role: "Modern Selin",
    bio: "Yaşamı matematiksel ve astrolojik kesinlikle analiz eder. Nokta atışı öngörüler sunar.",
    traits: ["Analitik", "Detaycı", "Dakik"],
    gradient: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-400", glow: "rgba(16,185,129,0.3)",
    borderAccent: "border-emerald-500/30", bgAccent: "bg-emerald-500/10",
    imageActive: "/avatars/selin.png"
  },
];

export const ALL_TOOLS = [
  { id: "astrology", name: "Doğum Haritası", iconName: "birthchart", href: "/dogum-haritasi", color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "dream", name: "Rüya Analizi", iconName: "dream", href: "/ruya-analizi", color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "bio", name: "Biyoritim", iconName: "biorhythm", href: "/biyoritim", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { id: "sphere", name: "Kristal Küre", iconName: "kristal", href: "/fallar/kristal", color: "text-rose-400", bg: "bg-rose-500/10" },
  { id: "numerology", name: "Numeroloji", iconName: "numerology", href: "/numeroloji", color: "text-indigo-400", bg: "bg-indigo-500/10" },
];

export const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

export const RELATIONSHIP_KEYS = [
  { value: "single", key: "profile.rel.single" },
  { value: "relationship", key: "profile.rel.relationship" },
  { value: "complicated", key: "profile.rel.complicated" },
  { value: "married", key: "profile.rel.married" },
  { value: "platonik", key: "profile.rel.platonik" },
];

export const LIFE_FOCUS_KEYS = [
  { value: "general", key: "profile.focus.general" },
  { value: "love", key: "profile.focus.love" },
  { value: "career", key: "profile.focus.career" },
  { value: "health", key: "profile.focus.health" },
  { value: "spiritual", key: "profile.focus.spiritual" },
];
