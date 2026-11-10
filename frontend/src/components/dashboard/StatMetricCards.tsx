import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { SiDocker } from "react-icons/si";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import { TbShieldExclamation } from "react-icons/tb";
import { DashboardStats } from "../../types/dashboard";

interface StatMetricCardsProps {
  stats: DashboardStats;
}

export const StatMetricCards: React.FC<StatMetricCardsProps> = ({ stats }) => {
  const cRef = useRef<HTMLDivElement>(null);
  const rRef = useRef<HTMLDivElement>(null);
  const fRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [
      { el: cRef.current, val: stats.containers_total },
      { el: rRef.current, val: stats.scanned_resources },
      { el: fRef.current, val: stats.findings_summary.critical + stats.findings_summary.high + stats.findings_summary.medium + stats.findings_summary.low },
      { el: aRef.current, val: stats.findings_summary.critical + stats.findings_summary.high },
    ];

    targets.forEach(({ el, val }) => {
      if (!el) return;
      const counter = { count: 0 };
      animate(counter, {
        count: val,
        ease: "outQuad",
        duration: 1000,
        onUpdate: () => {
          if (el) el.innerText = String(Math.round(counter.count));
        },
      });
    });
  }, [stats]);

  const cards = [
    {
      label: "Total Containers",
      sub: `${stats.containers_running} active / ${stats.containers_total - stats.containers_running} stopped`,
      icon: SiDocker,
      ref: cRef,
      color: "text-emerald-400",
      border: "border-slate-800/80",
    },
    {
      label: "Scanned Resources",
      sub: "Dockerfiles, Compose & daemon",
      icon: FiFileText,
      ref: rRef,
      color: "text-blue-400",
      border: "border-slate-800/80",
    },
    {
      label: "Total Misconfigurations",
      sub: `${stats.findings_summary.critical} critical, ${stats.findings_summary.high} high, ${stats.findings_summary.medium} medium`,
      icon: TbShieldExclamation,
      ref: fRef,
      color: "text-amber-400",
      border: "border-slate-800/80",
    },
    {
      label: "Critical & High Alerts",
      sub: "Requires immediate attention",
      icon: FiAlertTriangle,
      ref: aRef,
      color: "text-red-400",
      border: "border-red-500/20 bg-red-950/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border ${card.border} shadow-sm transition-colors hover:border-slate-700/80`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span
                ref={card.ref}
                className="text-2xl font-bold font-mono text-slate-100 tracking-tight"
              >
                0
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-400 truncate">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
