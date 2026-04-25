"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Map, Star, Users, Moon, Sparkles, Activity, Clock, Hash, ChevronRight } from "lucide-react";

const TOOL_META = {
  birth_chart:    { label: "Doğum Haritası",  hint: "Haritanı tam olarak gör",       path: "/dogum-haritasi", Icon: Map },
  horoscope:      { label: "Burç Yorumu",      hint: "Dönemin enerjisini incele",     path: "/burclar",        Icon: Star },
  compatibility:  { label: "Uyumluluk",        hint: "İki kişi arasındaki dinamik",  path: "/uyumluluk",      Icon: Users },
  dream_analysis: { label: "Rüya Analizi",     hint: "Bilinçaltı mesajlarını çöz",   path: "/ruya-analizi",   Icon: Moon },
  crystal_sphere: { label: "Kristal Küre",     hint: "Sezgisel bir bakış aç",        path: "/kristal",        Icon: Sparkles },
  biorhythm:      { label: "Biyoritim",        hint: "Döngülerini incele",            path: "/biyoritim",      Icon: Activity },
  horary:         { label: "Horary Astroloji", hint: "Soruya özel anlık harita",     path: "/horary",         Icon: Clock },
  numerology:     { label: "Numeroloji",       hint: "Sayıların sırrını keşfet",     path: "/numeroloji",     Icon: Hash },
} as const;

type VisualSlug = keyof typeof TOOL_META;

interface Props {
  visual: string;
  glow: string; // "rgba(R,G,B,0.3)" formatında
}

export default function ToolSuggestionCard({ visual, glow }: Props) {
  const router = useRouter();
  const meta = TOOL_META[visual as VisualSlug];
  if (!meta) return null;

  const { label, hint, path, Icon } = meta;

  // "rgba(244,63,94,0.3)" → "rgba(244,63,94," prefix'i çıkar
  const base = glow.replace(/[\d.]+\)$/, "");
  const withOpacity = (o: number) => `${base}${o})`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      onClick={() => router.push(path)}
      aria-label={`${label} aracına git`}
      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-colors duration-200 cursor-pointer w-fit"
      style={{
        background: withOpacity(0.05),
        borderColor: withOpacity(0.2),
        borderStyle: "dashed",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = withOpacity(0.45);
        (e.currentTarget as HTMLElement).style.background = withOpacity(0.09);
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = withOpacity(0.2);
        (e.currentTarget as HTMLElement).style.background = withOpacity(0.05);
      }}
      whileTap={{ scale: 0.97 }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: withOpacity(0.8) }} />
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[12px] font-medium leading-none text-white/65">{label}</span>
        <span className="text-[10px] leading-none text-white/30">{hint}</span>
      </div>
      <ChevronRight className="w-3 h-3 text-white/20 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/45" />
    </motion.button>
  );
}
