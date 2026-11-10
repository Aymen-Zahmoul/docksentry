import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm transition-colors hover:border-slate-700/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
