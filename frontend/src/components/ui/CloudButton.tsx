import React from "react";
import { cn } from "../../lib/utils";

export interface CloudButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "white" | "cyan" | "emerald";
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
    // 3D Clay Shading Profiles matching the physical ceramic/clay cloud
    const themes = {
      white: {
        text: "text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]",
        domeStyle: {
          background:
            "radial-gradient(circle at 38% 30%, #ffffff 0%, #f8fafc 40%, #e2e8f0 78%, #cbd5e1 100%)",
          boxShadow:
            "inset 0 -2.5px 5px rgba(148, 163, 184, 0.45), inset 0 2.5px 5px rgba(255, 255, 255, 0.95)",
        },
        coreStyle: {
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fafc 48%, #e2e8f0 100%)",
          boxShadow:
            "inset 0 -2px 4px rgba(148, 163, 184, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.95)",
        },
      },
      emerald: {
        text: "text-emerald-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]",
        domeStyle: {
          background:
            "radial-gradient(circle at 38% 30%, #f0fdf4 0%, #dcfce7 42%, #bbf7d0 78%, #86efac 100%)",
          boxShadow:
            "inset 0 -2.5px 5px rgba(74, 222, 128, 0.45), inset 0 2.5px 5px rgba(255, 255, 255, 0.95)",
        },
        coreStyle: {
          background:
            "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 48%, #bbf7d0 100%)",
          boxShadow:
            "inset 0 -2px 4px rgba(74, 222, 128, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.95)",
        },
      },
      cyan: {
        text: "text-sky-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]",
        domeStyle: {
          background:
            "radial-gradient(circle at 38% 30%, #f0f9ff 0%, #e0f2fe 42%, #bae6fd 78%, #7dd3fc 100%)",
          boxShadow:
            "inset 0 -2.5px 5px rgba(56, 189, 248, 0.45), inset 0 2.5px 5px rgba(255, 255, 255, 0.95)",
        },
        coreStyle: {
          background:
            "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 48%, #bae6fd 100%)",
          boxShadow:
            "inset 0 -2px 4px rgba(56, 189, 248, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.95)",
        },
      },
    }[variant];

    const sizeStyles = {
      sm: {
        container: "h-10 min-w-[124px] px-5 text-xs",
        iconSize: "w-3.5 h-3.5",
        topCrest: "w-7 h-7 -top-2.5 left-[48%] -translate-x-1/2",
        topLeft: "w-6 h-6 -top-1.5 left-[22%]",
        topRight: "w-6 h-6 -top-1.5 right-[22%]",
        farLeftTop: "w-6 h-6 top-0.5 -left-2",
        farLeftBottom: "w-5.5 h-5.5 bottom-0.5 -left-1.5",
        farRightTop: "w-6 h-6 top-0.5 -right-2",
        farRightBottom: "w-6.5 h-6.5 bottom-0 -right-2",
        bottomSwell: "w-7.5 h-7.5 -bottom-2.5 left-[53%] -translate-x-1/2",
        bottomLeft: "w-5.5 h-5.5 -bottom-1.5 left-[28%]",
        bottomRight: "w-5.5 h-5.5 -bottom-1.5 right-[28%]",
      },
      md: {
        container: "h-12 min-w-[150px] px-7 text-sm",
        iconSize: "w-4 h-4",
        topCrest: "w-9 h-9 -top-3.5 left-[48%] -translate-x-1/2",
        topLeft: "w-7.5 h-7.5 -top-2 left-[22%]",
        topRight: "w-7.5 h-7.5 -top-2 right-[22%]",
        farLeftTop: "w-7.5 h-7.5 top-0.5 -left-2.5",
        farLeftBottom: "w-7 h-7 bottom-0.5 -left-2",
        farRightTop: "w-7.5 h-7.5 top-0.5 -right-2.5",
        farRightBottom: "w-8 h-8 bottom-0 -right-2.5",
        bottomSwell: "w-9 h-9 -bottom-3.5 left-[53%] -translate-x-1/2",
        bottomLeft: "w-7 h-7 -bottom-2 left-[28%]",
        bottomRight: "w-7 h-7 -bottom-2 right-[28%]",
      },
      lg: {
        container: "h-14 min-w-[180px] px-9 text-base",
        iconSize: "w-5 h-5",
        topCrest: "w-11 h-11 -top-4 left-[48%] -translate-x-1/2",
        topLeft: "w-9 h-9 -top-2.5 left-[22%]",
        topRight: "w-9 h-9 -top-2.5 right-[22%]",
        farLeftTop: "w-9 h-9 top-0.5 -left-3",
        farLeftBottom: "w-8.5 h-8.5 bottom-0.5 -left-2.5",
        farRightTop: "w-9 h-9 top-0.5 -right-3",
        farRightBottom: "w-9.5 h-9.5 bottom-0 -right-3",
        bottomSwell: "w-11 h-11 -bottom-4 left-[53%] -translate-x-1/2",
        bottomLeft: "w-8.5 h-8.5 -bottom-2.5 left-[28%]",
        bottomRight: "w-8.5 h-8.5 -bottom-2.5 right-[28%]",
      },
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative group inline-flex items-center justify-center font-bold tracking-tight select-none",
          "transition-all duration-300 ease-out cursor-pointer",
          // Physical volumetric drop-shadow that wraps the entire compound cloud silhouette
          "drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]",
          "hover:-translate-y-1 hover:drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]",
          "active:translate-y-0.5 active:scale-[0.98] active:drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
          "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
          className
        )}
        {...props}
      >
        {/* ========================================================
            3D CLAYMORPHIC CLOUD PERIMETER (7-8 BULBOUS DOMES)
            Replicating the exact puffy white cloud from reference
            ======================================================== */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 1. Core central connecting volume */}
          <div
            className="absolute inset-x-2 inset-y-1 rounded-full transition-transform duration-300 group-hover:scale-[1.01]"
            style={themes.coreStyle}
          />

          {/* 2. Top-Center Dominant Crest (highest peak) */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.topCrest
            )}
            style={themes.domeStyle}
          />

          {/* 3. Top-Left Bulbous Dome */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.topLeft
            )}
            style={themes.domeStyle}
          />

          {/* 4. Top-Right Bulbous Dome */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.topRight
            )}
            style={themes.domeStyle}
          />

          {/* 5. Far-Left Upper Flank */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.farLeftTop
            )}
            style={themes.domeStyle}
          />

          {/* 6. Far-Left Lower Flank */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.farLeftBottom
            )}
            style={themes.domeStyle}
          />

          {/* 7. Far-Right Upper Flank */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.farRightTop
            )}
            style={themes.domeStyle}
          />

          {/* 8. Far-Right Lower Flank */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.farRightBottom
            )}
            style={themes.domeStyle}
          />

          {/* 9. Bottom-Center Drooping Swell (distinctive feature from reference) */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.bottomSwell
            )}
            style={themes.domeStyle}
          />

          {/* 10. Bottom-Left Rounded Cheek */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.bottomLeft
            )}
            style={themes.domeStyle}
          />

          {/* 11. Bottom-Right Rounded Cheek */}
          <div
            className={cn(
              "absolute rounded-full aspect-square transition-transform duration-300 group-hover:scale-105",
              sizeStyles.bottomRight
            )}
            style={themes.domeStyle}
          />

          {/* Top Ceramic Specular Highlight Sheen */}
          <div className="absolute inset-x-5 top-1 h-2 rounded-full bg-white/70 blur-[0.6px]" />
        </div>

        {/* ========================================================
            BUTTON LABEL & ICON (Layered on top of 3D cloud)
            ======================================================== */}
        <span
          className={cn(
            "relative z-20 flex items-center justify-center gap-2 font-bold font-sans tracking-tight",
            sizeStyles.container,
            themes.text
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
          <span className="font-bold tracking-tight">{children}</span>
        </span>
      </button>
    );
  }
);

CloudButton.displayName = "CloudButton";
