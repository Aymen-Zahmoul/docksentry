import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "white" | "cyan" | "obsidian" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "white",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium font-mono select-none transition-all duration-150 rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-slate-400";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5",
  }[size];

  const variants = {
    // High-contrast Apple/Linear white pill (super clean & prominent)
    white:
      "bg-white hover:bg-slate-100 text-slate-950 font-semibold shadow-sm active:bg-slate-200",
    primary:
      "bg-white hover:bg-slate-100 text-slate-950 font-semibold shadow-sm active:bg-slate-200",
    // Electric Ice-Cyan variant
    cyan:
      "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 active:bg-cyan-500/30",
    // Sleek Obsidian Glass with luminous border
    obsidian:
      "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/15 hover:border-white/30 shadow-sm active:bg-slate-950",
    secondary:
      "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/[0.08] shadow-sm",
    outline:
      "bg-transparent hover:bg-white/[0.05] text-slate-300 border border-white/[0.1]",
    ghost:
      "bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-white",
    danger:
      "bg-red-600/90 hover:bg-red-500 text-white shadow-sm active:bg-red-700",
  }[variant];

  return (
    <button
      className={cn(base, sizeClasses, variants, className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
