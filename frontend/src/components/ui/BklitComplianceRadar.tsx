import React from "react";
import { TbRadar2 } from "react-icons/tb";

interface CategoryMetric {
  name: string;
  passRate: number; // 0 - 100%
  violations: number;
  color: string;
}

export const BklitComplianceRadar: React.FC = () => {
  const categories: CategoryMetric[] = [
    { name: "Identity (Root/UID)", passRate: 64, violations: 5, color: "#F97316" },
    { name: "Privileges Mode", passRate: 75, violations: 2, color: "#EF4444" },
    { name: "Volume Mounts", passRate: 72, violations: 2, color: "#EF4444" },
    { name: "Linux Capabilities", passRate: 78, violations: 3, color: "#F97316" },
    { name: "Network & 0.0.0.0", passRate: 60, violations: 4, color: "#F59E0B" },
    { name: "Filesystem Immutability", passRate: 85, violations: 1, color: "#10B981" },
  ];

  return (
    <div className="relative p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TbRadar2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-100">Hardening Posture by Category</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          CIS Benchmark v1.6
        </span>
      </div>

      <div className="space-y-3 font-mono">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">{cat.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {cat.violations} violation{cat.violations === 1 ? "" : "s"}
                </span>
                <span style={{ color: cat.color }} className="font-semibold">
                  {cat.passRate}% Hardened
                </span>
              </div>
            </div>

            {/* Simple Flat Progress Bar */}
            <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${cat.passRate}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
