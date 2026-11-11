import React from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { TbShieldExclamation } from "react-icons/tb";
import { SeverityBadge } from "../ui/Badge";
import { TopIssue } from "../../types/dashboard";

interface FluidIssuesStreamProps {
  issues: TopIssue[];
}

export const FluidIssuesStream: React.FC<FluidIssuesStreamProps> = ({ issues }) => {
  return (
    <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div>
          <h3 className="text-xs font-semibold text-slate-200">Recurring Insecure Patterns</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">High-frequency risks across audited targets</p>
        </div>
        <Link
          to="/findings"
          className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] flex items-center gap-1 transition-colors"
        >
          <span>All Findings</span>
          <FiArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Fluid List */}
      <div className="divide-y divide-white/[0.04] flex-1">
        {issues.map((issue) => (
          <Link
            key={issue.rule_id}
            to={`/findings?search=${encodeURIComponent(issue.rule_id)}`}
            className="py-3 px-1.5 flex items-center justify-between gap-3 group hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {issue.rule_id}
              </span>
              <div className="min-w-0">
                <div className="text-xs text-slate-200 group-hover:text-white transition-colors truncate">
                  {issue.title}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                  Category: {issue.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <SeverityBadge severity={issue.severity} size="sm" showDot={false} />
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-white/[0.06]">
                {issue.count}x
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FluidIssuesStream;
