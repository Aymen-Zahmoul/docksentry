import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FindingsSummary } from "../../types/dashboard";

interface RiskSpectrumProps {
  summary: FindingsSummary;
}

export const RiskSpectrum: React.FC<RiskSpectrumProps> = ({ summary }) => {
  const [activeTier, setActiveTier] = useState<string | null>(null);

  const total = summary.critical + summary.high + summary.medium + summary.low + summary.info;

  const tiers = [
    {
      id: "CRITICAL",
      label: "Critical",
      count: summary.critical,
      color: "bg-red-500",
      text: "text-red-400",
      border: "border-red-500/30",
      desc: "Privileged mode & Docker socket mounts",
    },
    {
      id: "HIGH",
      label: "High",
      count: summary.high,
      color: "bg-orange-500",
      text: "text-orange-400",
      border: "border-orange-500/30",
      desc: "Root UID 0 & elevated capabilities",
    },
    {
      id: "MEDIUM",
      label: "Medium",
      count: summary.medium,
      color: "bg-amber-500",
      text: "text-amber-400",
      border: "border-amber-500/30",
      desc: "0.0.0.0 exposures & writable rootfs",
    },
    {
      id: "LOW",
      label: "Low",
      count: summary.low,
      color: "bg-blue-500",
      text: "text-blue-400",
      border: "border-blue-500/30",
      desc: "Missing healthchecks",
    },
    {
      id: "INFO",
      label: "Info",
      count: summary.info,
      color: "bg-slate-500",
      text: "text-slate-400",
      border: "border-slate-500/30",
      desc: "Best practices",
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Risk Severity Distribution</span>
          <span className="text-[11px] font-mono text-slate-400">
            ({total} detected misconfiguration{total === 1 ? "" : "s"})
          </span>
        </div>

        <Link
          to="/findings"
          className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] transition-colors"
        >
          View all findings →
        </Link>
      </div>

      {/* Fluid Segmented Spectrum Bar */}
      <div className="h-3 w-full rounded-full bg-slate-950/80 overflow-hidden flex gap-0.5 p-0.5 border border-white/[0.05]">
        {tiers.map((tier) => {
          if (tier.count === 0 && total > 0) return null;
          const pct = total > 0 ? (tier.count / total) * 100 : 20;

          return (
            <motion.div
              key={tier.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onMouseEnter={() => setActiveTier(tier.id)}
              onMouseLeave={() => setActiveTier(null)}
              className={`h-full rounded-sm cursor-pointer transition-opacity ${tier.color} ${
                activeTier && activeTier !== tier.id ? "opacity-35" : "opacity-100"
              }`}
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          );
        })}
      </div>

      {/* Interactive Legend Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
        {tiers.map((tier) => {
          const isSelected = activeTier === tier.id;
          return (
            <Link
              key={tier.id}
              to={`/findings?severity=${tier.id}`}
              onMouseEnter={() => setActiveTier(tier.id)}
              onMouseLeave={() => setActiveTier(null)}
              className={`p-2.5 rounded-xl border transition-all text-left group ${
                isSelected
                  ? `bg-white/[0.06] ${tier.border}`
                  : "bg-slate-950/30 border-white/[0.03] hover:border-white/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase ${tier.text}`}>
                  {tier.label}
                </span>
                <span className="text-white font-bold text-xs">{tier.count}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">
                {tier.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RiskSpectrum;
