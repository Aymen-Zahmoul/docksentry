import React from "react";
import { cn } from "../../lib/utils";

export interface CloudButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "white" | "cyan" | "emerald" | "amber";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

export const CloudButton = React.forwardRef<HTMLButtonElement, CloudButtonProps>(
  (
    {
      className,
      variant = "white",
      size = "sm",
      icon,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Color schemes for clouds
    const variantStyles = {
      white: {
        bg: "bg-gradient-to-b from-white via-slate-50 to-slate-200",
        text: "text-slate-950",
        shadow:
          "drop-shadow-[0_4px_14px_rgba(255,255,255,0.25)] hover:drop-shadow-[0_6px_22px_rgba(255,255,255,0.45)]",
        border: "border-white/90",
        glow: "rgba(255,255,255,0.6)",
      },
      cyan: {
        bg: "bg-gradient-to-b from-cyan-100 via-sky-100 to-cyan-200",
        text: "text-cyan-950",
        shadow:
          "drop-shadow-[0_4px_14px_rgba(56,189,248,0.3)] hover:drop-shadow-[0_6px_22px_rgba(56,189,248,0.55)]",
        border: "border-cyan-200/90",
        glow: "rgba(56,189,248,0.6)",
      },
      emerald: {
        bg: "bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-200",
        text: "text-emerald-950",
        shadow:
          "drop-shadow-[0_4px_14px_rgba(52,211,153,0.3)] hover:drop-shadow-[0_6px_22px_rgba(52,211,153,0.55)]",
        border: "border-emerald-200/90",
        glow: "rgba(52,211,153,0.6)",
      },
      amber: {
        bg: "bg-gradient-to-b from-amber-100 via-yellow-100 to-amber-200",
        text: "text-amber-950",
        shadow:
          "drop-shadow-[0_4px_14px_rgba(251,191,36,0.3)] hover:drop-shadow-[0_6px_22px_rgba(251,191,36,0.55)]",
        border: "border-amber-200/90",
        glow: "rgba(251,191,36,0.6)",
      },
    }[variant];

    const sizeStyles = {
      sm: {
        container: "h-9 px-5 text-xs",
        iconSize: "w-3.5 h-3.5",
        puff1: "w-5 h-5 -top-2 left-[18%]",
        puff2: "w-7 h-7 -top-3 left-[42%]",
        puff3: "w-5 h-5 -top-1.5 left-[68%]",
        puffBottom: "w-4 h-4 -bottom-1 left-[32%]",
      },
      md: {
        container: "h-11 px-7 text-sm",
        iconSize: "w-4 h-4",
        puff1: "w-6 h-6 -top-2.5 left-[18%]",
        puff2: "w-9 h-9 -top-3.5 left-[42%]",
        puff3: "w-6 h-6 -top-2 left-[68%]",
        puffBottom: "w-5 h-5 -bottom-1.5 left-[34%]",
      },
      lg: {
        container: "h-13 px-9 text-base",
        iconSize: "w-5 h-5",
        puff1: "w-8 h-8 -top-3.5 left-[18%]",
        puff2: "w-11 h-11 -top-4.5 left-[42%]",
        puff3: "w-8 h-8 -top-3 left-[68%]",
        puffBottom: "w-6 h-6 -bottom-2 left-[34%]",
      },
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative group inline-flex items-center justify-center font-bold font-sans tracking-tight select-none",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-0.5 active:translate-y-0 active:scale-98",
          "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
          variantStyles.shadow,
          className
        )}
        {...props}
      >
        {/* Layer 1: Seamless Cloud Puffs (Multi-radius organic lobes) */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-[1.02]",
            variantStyles.bg
          )}
        >
          {/* Top-Left Cloud Puff */}
          <span
            className={cn(
              "absolute rounded-full transition-transform duration-300 group-hover:scale-105",
              sizeStyles.puff1,
              variantStyles.bg
            )}
          />
          {/* Top-Center Big Cumulus Crest */}
          <span
            className={cn(
              "absolute rounded-full transition-transform duration-300 group-hover:scale-105",
              sizeStyles.puff2,
              variantStyles.bg
            )}
          />
          {/* Top-Right Cloud Puff */}
          <span
            className={cn(
              "absolute rounded-full transition-transform duration-300 group-hover:scale-105",
              sizeStyles.puff3,
              variantStyles.bg
            )}
          />
          {/* Subtle Bottom-Center Floating Swell */}
          <span
            className={cn(
              "absolute rounded-full transition-transform duration-300 group-hover:scale-105",
              sizeStyles.puffBottom,
              variantStyles.bg
            )}
          />
        </div>

        {/* Layer 2: Glossy / Frosted Cloud Sheen Reflection */}
        <div className="absolute inset-x-3 top-1 h-2 rounded-full bg-white/60 blur-[0.5px] pointer-events-none" />

        {/* Layer 3: Interactive Content Label & Icon */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center gap-2",
            sizeStyles.container,
            variantStyles.text
          )}
        >
          {loading ? (
            <svg
              className={cn("animate-spin", sizeStyles.iconSize)}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            icon && <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="font-semibold tracking-normal">{children}</span>
        </span>
      </button>
    );
  }
);

CloudButton.displayName = "CloudButton";
