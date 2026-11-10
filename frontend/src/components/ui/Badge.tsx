import React from "react";
import { Severity, FindingStatus } from "../../types/finding";

interface SeverityBadgeProps {
  severity: Severity;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = "md",
  showDot = true,
}) => {
  const styles = {
    CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    LOW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    INFO: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }[severity];

  const dotColors = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-amber-500",
    LOW: "bg-blue-500",
    INFO: "bg-slate-400",
  }[severity];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-xs",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${styles} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {severity}
    </span>
  );
};

interface StatusBadgeProps {
  status: FindingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    OPEN: "bg-red-500/10 text-red-400 border-red-500/20",
    RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    IGNORED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono rounded border uppercase font-medium ${styles}`}>
      {status}
    </span>
  );
};
