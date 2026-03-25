"use client";

import { SelectHTMLAttributes } from "react";

interface CosmicSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  icon?: string;
}

export default function CosmicSelect({ label, error, options, icon, className = "", ...props }: CosmicSelectProps) {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest pl-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
            {icon}
          </span>
        )}
        <select
          className={`
            w-full bg-white/5 border border-white/10 rounded-xl py-3.5 
            ${icon ? "pl-12" : "pl-5"} pr-10 text-white 
            appearance-none focus:outline-none focus:border-purple-500/50 
            focus:bg-white/10 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] 
            transition-all duration-300 backdrop-blur-sm cursor-pointer ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a1a] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-rose-400 text-xs pl-1">{error}</p>}
    </div>
  );
}
