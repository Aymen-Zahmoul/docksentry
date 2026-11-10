import React, { useEffect, useState } from "react";
import { TbShieldCheck } from "react-icons/tb";
import { RulesCatalog } from "../components/rules/RulesCatalog";
import { getRules, toggleRule } from "../services/rules.service";
import { SecurityRule } from "../types/rule";

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRules();
        setRules(data);
      } catch (err) {
        console.error("Failed to load rules:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleRule(id);
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-sentry-text">
            Security Rule Catalog
          </h1>
          <p className="text-xs text-sentry-muted mt-1">
            Standard detection policies aligned with the CIS Docker Benchmark and container hardening standards.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sentry-surface/90 backdrop-blur-md border border-sentry-border text-xs font-mono">
          <TbShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sentry-text font-semibold">{activeCount} / {rules.length} Policies Active</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-sentry-muted">
          Loading rule library...
        </div>
      ) : (
        <RulesCatalog rules={rules} onToggleRule={handleToggle} />
      )}
    </div>
  );
};
