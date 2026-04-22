"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, Loader2, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface LocationResult {
  displayName: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  value: string;
  onChange: (location: LocationResult | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Variant: 'default' (dark glass), 'onboarding' (lighter bg) */
  variant?: "default" | "onboarding";
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationSearch({
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  variant = "default",
}: LocationSearchProps) {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Sync external value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Compute dropdown position when open
  useEffect(() => {
    if (!open || !inputRef.current) return;
    function updatePos() {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const lang = language || "tr";
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q,
              format: "json",
              limit: "6",
              addressdetails: "0",
              "accept-language": lang,
            }),
          {
            headers: { "User-Agent": "AstralisApp/1.0" },
          }
        );
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  function handleInputChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 300);
  }

  function handleSelect(item: NominatimResult) {
    const parts = item.display_name.split(",").map((s) => s.trim());
    const short = parts.slice(0, 2).join(", ");
    setQuery(short);
    setOpen(false);
    setResults([]);
    onChange({
      displayName: short,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    onChange(null);
  }

  const isOnboarding = variant === "onboarding";
  const baseInput = isOnboarding
    ? "bg-white/5 border-white/10 text-white"
    : "bg-white/[0.04] border-white/[0.06] text-white";

  // Dropdown rendered via portal to escape overflow:hidden parents
  const dropdownContent = open && results.length > 0 && typeof document !== "undefined"
    ? createPortal(
        <div
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="rounded-xl border border-white/10 bg-[#0c0c14]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {results.map((item, i) => {
              const parts = item.display_name.split(",").map((s) => s.trim());
              const primary = parts[0];
              const secondary = parts.slice(1, 3).join(", ");
              return (
                <button
                  key={`${item.lat}-${item.lon}-${i}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.06] transition-colors text-left border-b border-white/[0.04] last:border-none"
                >
                  <MapPin className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{primary}</div>
                    {secondary && (
                      <div className="text-xs text-white/40 truncate">{secondary}</div>
                    )}
                  </div>
                </button>
              );
            })}
            <div className="px-4 py-1.5 text-[10px] text-white/20 text-center">
              {t("location.powered_by")}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const noResultsContent = open && query.length >= 2 && results.length === 0 && !loading && typeof document !== "undefined"
    ? createPortal(
        <div
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
        >
          <div className="rounded-xl border border-white/10 bg-[#0c0c14]/95 backdrop-blur-xl shadow-2xl p-4 text-center text-sm text-white/40">
            {t("location.no_results")}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder || t("location.placeholder")}
          className={`w-full h-12 pl-11 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all ${baseInput} ${inputClassName}`}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {dropdownContent}
      {noResultsContent}
    </div>
  );
}
