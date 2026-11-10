import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
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
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:bg-emerald-700",
    secondary:
      "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-sm",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-sm active:bg-red-700",
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
