"use client";

import { InputHTMLAttributes } from "react";

interface CosmicInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export default function CosmicInput({ label, error, icon, className = "", ...props }: CosmicInputProps) {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest pl-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl group-focus-within:scale-110 transition-transform duration-300">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-white/5 border border-white/10 rounded-xl py-3.5 
            ${icon ? "pl-12" : "pl-5"} pr-5 text-white 
            placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 
            focus:bg-white/10 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] 
            transition-all duration-300 backdrop-blur-sm ${className}
          `}
          {...props}
        />
        {/* Border Glow Effect */}
        <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-focus-within:border-purple-500/30 pointer-events-none transition-all duration-300" />
      </div>
      {error && <p className="text-rose-400 text-xs pl-1">{error}</p>}
    </div>
  );
}
