import React, { useState } from "react";
import { FiSearch, FiSliders, FiChevronRight, FiFileText, FiLayers } from "react-icons/fi";
import { SiDocker } from "react-icons/si";
import { Finding, Severity, FindingStatus, FindingCategory } from "../../types/finding";
import { SeverityBadge, StatusBadge } from "../ui/Badge";

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  initialSearch?: string;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  onSelectFinding,
  initialSearch = "",
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FindingStatus | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<FindingCategory | "ALL">("ALL");

  const severities: (Severity | "ALL")[] = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
  const statuses: (FindingStatus | "ALL")[] = ["ALL", "OPEN", "RESOLVED", "IGNORED"];
  const categories: (FindingCategory | "ALL")[] = [
    "ALL",
    "IDENTITY",
    "PRIVILEGES",
    "VOLUMES",
    "CAPABILITIES",
    "NETWORK",
    "FILESYSTEM",
    "RELIABILITY",
  ];

  const filtered = findings.filter((f) => {
    if (selectedSeverity !== "ALL" && f.severity !== selectedSeverity) return false;
    if (selectedStatus !== "ALL" && f.status !== selectedStatus) return false;
    if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        f.title.toLowerCase().includes(q) ||
        f.rule_id.toLowerCase().includes(q) ||
        f.resource.toLowerCase().includes(q) ||
        f.evidence.toLowerCase().includes(q) ||
        f.source.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "compose_service":
        return FiLayers;
      case "dockerfile":
        return FiFileText;
      case "container":
        return SiDocker;
      default:
        return FiFileText;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search findings by rule ID, title, evidence, resource..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg bg-slate-950/60 border border-white/[0.06] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FiSliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 text-xs font-mono rounded-lg bg-slate-950/60 border border-white/[0.06] text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity Pills & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">
              Severity:
            </span>
            {severities.map((sev) => {
              const active = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                    active
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-slate-950/50 text-slate-400 border-white/[0.05] hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">
              Status:
            </span>
            {statuses.map((st) => {
              const active = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2 py-0.5 text-xs font-mono rounded border transition-all ${
                    active
                      ? "bg-slate-700 text-white border-slate-500"
                      : "bg-slate-950/50 text-slate-400 border-white/[0.05] hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] bg-slate-950/40 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Rule</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Issue Title & Evidence</th>
                <th className="py-3 px-4">Affected Resource</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
              {filtered.length > 0 ? (
                filtered.map((finding) => {
                  const Icon = getResourceIcon(finding.resource_type);
                  return (
                    <tr
                      key={finding.id}
                      onClick={() => onSelectFinding(finding)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Rule ID */}
                      <td className="py-3.5 px-4 font-bold text-slate-300 whitespace-nowrap">
                        {finding.rule_id}
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SeverityBadge severity={finding.severity} size="sm" />
                      </td>

                      {/* Title & Evidence Preview */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {finding.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          <span className="text-amber-400">Evidence:</span> {finding.evidence}
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-200 font-semibold">{finding.resource}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {finding.source}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={finding.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 group-hover:underline font-medium">
                          Inspect & Remediate
                          <FiChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    No security findings match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{filtered.length}</strong> of{" "}
            <strong>{findings.length}</strong> findings
          </span>
          <span>Click any finding to inspect attack vector & remediation</span>
        </div>
      </div>
    </div>
  );
};
