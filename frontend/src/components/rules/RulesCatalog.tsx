import React, { useState } from "react";
import { FiSearch, FiBookOpen, FiAlertTriangle } from "react-icons/fi";
import { SecurityRule } from "../../types/rule";
import { SeverityBadge } from "../ui/Badge";
import { Switch } from "../ui/Switch";

interface RulesCatalogProps {
  rules: SecurityRule[];
  onToggleRule: (id: string) => void;
}

export const RulesCatalog: React.FC<RulesCatalogProps> = ({ rules, onToggleRule }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    "ALL",
    "IDENTITY",
    "PRIVILEGES",
    "VOLUMES",
    "CAPABILITIES",
    "NETWORK",
    "FILESYSTEM",
    "RELIABILITY",
  ];

  const filtered = rules.filter((r) => {
    if (selectedCategory !== "ALL" && r.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.cis_benchmark && r.cis_benchmark.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative flex-1 w-full">
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules by ID (e.g. DS002), CIS reference, title..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-lg bg-slate-950/60 border border-white/[0.06] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                selectedCategory === cat
                  ? "bg-slate-700 text-white border-slate-600"
                  : "bg-slate-950/50 text-slate-400 border-white/[0.05] hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl bg-slate-900/30 backdrop-blur-md border transition-colors ${
              rule.enabled
                ? "border-white/[0.06] hover:border-white/[0.12]"
                : "border-white/[0.03] opacity-60 bg-slate-950/20"
            }`}
          >
            {/* Header: Rule Code + Severity + Switch */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {rule.code}
                </span>
                <SeverityBadge severity={rule.severity} size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {rule.enabled ? "ACTIVE" : "DISABLED"}
                </span>
                <Switch
                  checked={rule.enabled}
                  onChange={() => onToggleRule(rule.id)}
                />
              </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-slate-100 leading-snug">
              {rule.title}
            </h4>

            {/* Description */}
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {rule.description}
            </p>

            {/* Security Rationale / Attack Vector */}
            <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-850 text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <FiAlertTriangle className="w-3 h-3" />
                <span>Security Rationale:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{rule.rationale}</p>
            </div>

            {/* Footer Metadata */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <FiBookOpen className="w-3 h-3 text-slate-400" />
                {rule.cis_benchmark}
              </span>
              <span className="text-slate-500 uppercase">
                Targets: {rule.applicable_to.join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
