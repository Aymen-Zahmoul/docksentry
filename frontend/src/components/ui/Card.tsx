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
        "rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] transition-colors hover:border-white/[0.1]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
