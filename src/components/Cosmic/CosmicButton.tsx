"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface CosmicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function CosmicButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className = "",
  ...props
}: CosmicButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 rounded-xl overflow-hidden group active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] border border-white/10",
    secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Hover Light Streak */}
      <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-full transition-all duration-700 ease-in-out" />

      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="group-hover:scale-110 transition-transform">{icon}</span>}
        {children}
      </span>
    </button>
  );
}
