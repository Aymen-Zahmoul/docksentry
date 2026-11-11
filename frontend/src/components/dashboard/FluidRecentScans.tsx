import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiArrowUpRight, FiLayers, FiFileText, FiRadio, FiActivity } from "react-icons/fi";
import { Scan } from "../../types/scan";

interface FluidRecentScansProps {
  scans: Scan[];
}

export const FluidRecentScans: React.FC<FluidRecentScansProps> = ({ scans }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "compose":
        return FiLayers;
      case "dockerfile":
        return FiFileText;
      case "runtime":
        return FiRadio;
      default:
        return FiActivity;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div>
          <h3 className="text-xs font-semibold text-slate-200">Recent Security Audits</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Automated and manual execution runs</p>
        </div>
        <Link
          to="/scans"
          className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
        >
          <span>All Scans</span>
          <FiArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Fluid List */}
      <div className="divide-y divide-white/[0.04] flex-1">
        {scans.slice(0, 4).map((scan) => {
          const Icon = getIcon(scan.scan_type);
          const totalFindings =
            scan.findings_count.critical +
            scan.findings_count.high +
            scan.findings_count.medium +
            scan.findings_count.low;

          return (
            <div
              key={scan.id}
              className="py-3 px-1.5 flex items-center justify-between gap-3 text-xs font-mono group hover:bg-white/[0.02] rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-slate-950/80 border border-white/[0.05] text-slate-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-slate-200 font-medium truncate">
                    {scan.target}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="uppercase">{scan.scan_type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {scan.duration_seconds}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-200 block">
                    {totalFindings} issues
                  </span>
                  {scan.findings_count.critical > 0 ? (
                    <span className="text-[10px] text-red-400 block">
                      {scan.findings_count.critical} critical
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 block">
                      clean
                    </span>
                  )}
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-white/[0.06]">
                  {scan.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FluidRecentScans;
