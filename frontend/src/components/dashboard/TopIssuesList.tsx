import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { TbShieldExclamation } from "react-icons/tb";
import { SeverityBadge } from "../ui/Badge";
import { TopIssue } from "../../types/dashboard";

interface TopIssuesListProps {
  issues: TopIssue[];
}

export const TopIssuesList: React.FC<TopIssuesListProps> = ({ issues }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Most Common Insecure Patterns</h3>
          <p className="text-xs text-slate-400 mt-0.5">Recurring misconfigurations across targets</p>
        </div>
        <Link
          to="/findings"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>View All</span>
          <FiChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5 flex-1">
        {issues.map((issue) => (
          <Link
            key={issue.rule_id}
            to={`/findings?search=${encodeURIComponent(issue.rule_id)}`}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                <TbShieldExclamation className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    {issue.rule_id}
                  </span>
                  <span className="text-xs text-slate-200 truncate group-hover:text-white transition-colors">
                    {issue.title}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                  Category: {issue.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <SeverityBadge severity={issue.severity} size="sm" showDot={false} />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {issue.count}x
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
