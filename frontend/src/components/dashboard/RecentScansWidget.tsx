import React from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiClock, FiChevronRight, FiFileText, FiLayers, FiRadio } from "react-icons/fi";
import { Scan } from "../../types/scan";

interface RecentScansWidgetProps {
  scans: Scan[];
}

export const RecentScansWidget: React.FC<RecentScansWidgetProps> = ({ scans }) => {
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
    <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Recent Audit Scans</h3>
          <p className="text-xs text-slate-400 mt-0.5">Execution logs and targeted resource audits</p>
        </div>
        <Link
          to="/scans"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>All Scans</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-800/60">
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
              className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-slate-200 font-medium truncate">
                    {scan.target}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{scan.id}</span>
                    <span>•</span>
                    <span className="uppercase">{scan.scan_type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {scan.duration_seconds}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200">
                    {totalFindings} issues
                  </div>
                  <div className="text-[10px] text-red-400">
                    {scan.findings_count.critical} critical
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
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
