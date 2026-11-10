import React, { useState } from "react";
import { motion } from "motion/react";
import { FiActivity } from "react-icons/fi";

export interface BklitBarItem {
  id: string;
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  percentage?: number;
}

interface BklitBarChartProps {
  items: BklitBarItem[];
  title: string;
  subtitle?: string;
}

export const BklitBarChart: React.FC<BklitBarChartProps> = ({
  items,
  title,
  subtitle,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const total = items.reduce((acc, curr) => acc + curr.value, 0);
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="relative p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800 text-slate-300">
          <FiActivity className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-100">{total}</span>
          <span className="text-[10px] text-slate-400 uppercase">Findings</span>
        </div>
      </div>

      {/* Clean Flat Bar Chart */}
      <div className="relative grid grid-cols-5 gap-3 h-48 items-end pt-4 pb-2 border-b border-slate-800">
        {items.map((item) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 6);
          const isHovered = hoveredId === item.id;
          const pctOfTotal = total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Value Label above Bar */}
              <div
                className={`font-mono text-xs font-semibold transition-colors duration-150 mb-1.5 ${
                  isHovered ? "text-white" : "text-slate-400"
                }`}
              >
                {item.value}
              </div>

              {/* Simple Flat Bar */}
              <div className="w-full max-w-[42px] relative flex flex-col justify-end h-full">
                <motion.div
                  className="w-full rounded-t-md transition-opacity"
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    backgroundColor: item.color,
                    opacity: hoveredId && !isHovered ? 0.45 : 1,
                  }}
                />
              </div>

              {/* Clean Minimalist Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-30 px-2.5 py-1 rounded bg-slate-950 border border-slate-700 shadow-lg text-[11px] font-mono whitespace-nowrap text-slate-200">
                  <span className="font-medium">{item.label}:</span>{" "}
                  <span className="font-bold text-white">{item.value}</span> ({pctOfTotal}%)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Labels */}
      <div className="grid grid-cols-5 gap-3 pt-3 text-center font-mono">
        {items.map((item) => (
          <div key={item.id}>
            <span
              className={`text-[11px] uppercase font-semibold tracking-wider block transition-colors ${
                hoveredId === item.id ? "text-white" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {item.sublabel || `${item.value} items`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
