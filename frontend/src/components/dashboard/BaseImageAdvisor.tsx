import React, { useState, useEffect } from "react";
import {
  FiLayers,
  FiZap,
  FiArrowRight,
  FiCheck,
  FiRefreshCw,
  FiShield,
  FiDatabase,
  FiAlertTriangle,
  FiRotateCcw,
} from "react-icons/fi";
import { ImageAdvisorItem } from "../../types/finding";
import { getImageAdvisories, remediateFinding, rollbackFinding } from "../../services/findings.service";
import { Button } from "../ui/Button";

interface BaseImageAdvisorProps {
  onRemediated?: () => void;
}

export const BaseImageAdvisor: React.FC<BaseImageAdvisorProps> = ({ onRemediated }) => {
  const [advisories, setAdvisories] = useState<ImageAdvisorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAdvisories = async () => {
    try {
      const data = await getImageAdvisories();
      setAdvisories(data);
    } catch (err) {
      console.error("Failed fetching image advisories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, []);

  const handleOptimize = async (item: ImageAdvisorItem) => {
    if (!item.finding_id) return;
    setProcessingId(item.id);
    try {
      await remediateFinding(item.finding_id);
      setAdvisories((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, remediation_status: "REMEDIATED" } : a))
      );
      if (onRemediated) onRemediated();
    } catch (err) {
      console.error("Failed optimizing image:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRollback = async (item: ImageAdvisorItem) => {
    if (!item.finding_id) return;
    setProcessingId(item.id);
    try {
      await rollbackFinding(item.finding_id);
      setAdvisories((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, remediation_status: "PENDING" } : a))
      );
      if (onRemediated) onRemediated();
    } catch (err) {
      console.error("Failed rolling back image:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/[0.06] flex items-center justify-center text-xs font-mono text-slate-400 gap-2">
        <FiRefreshCw className="w-4 h-4 animate-spin text-violet-400" />
        <span>Auditing container images & CVE footprint...</span>
      </div>
    );
  }

  if (advisories.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/[0.06] backdrop-blur-md space-y-5">
      {/* Module Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FiLayers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Base Image & CVE Footprint Advisor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {advisories.length} Images Audited
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies bloated parent distributions, upstream package CVE exposures, and minimal hardened alternatives.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdvisories}
          title="Refresh Image Audit"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advisories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {advisories.map((adv) => {
          const isRemediated = adv.remediation_status === "REMEDIATED";
          const isBusy = processingId === adv.id;

          return (
            <div
              key={adv.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                isRemediated
                  ? "bg-emerald-950/10 border-emerald-500/20"
                  : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {/* Header row: target resource & source */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08] text-[11px]">
                  {adv.target_resource}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {adv.source_file}
                </span>
              </div>

              {/* Transformation visual ribbon */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between gap-2 text-xs font-mono">
                {/* Current bloated spec */}
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current</div>
                  <div className="font-semibold text-rose-300 truncate">{adv.current_image}</div>
                  <div className="text-[10px] text-slate-400">
                    ~{adv.current_size_mb} MB • ~{adv.current_cve_estimate} CVEs
                  </div>
                </div>

                <FiArrowRight className="w-4 h-4 text-violet-400 shrink-0" />

                {/* Recommended hardened spec */}
                <div className="text-right min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Recommended</div>
                  <div className="font-semibold text-emerald-400 truncate">{adv.recommended_image}</div>
                  <div className="text-[10px] text-emerald-400/80">
                    ~{adv.recommended_size_mb} MB • ~{adv.recommended_cve_estimate} CVEs
                  </div>
                </div>
              </div>

              {/* Optimization Metric Badges & Action */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    -{adv.size_reduction_pct}% Disk
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    -{adv.cve_reduction_pct}% CVEs
                  </span>
                </div>

                <div>
                  {isRemediated ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Hardened</span>
                      </span>
                      {adv.finding_id && (
                        <button
                          onClick={() => handleRollback(adv)}
                          disabled={isBusy}
                          title="Undo changes"
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <FiRotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    adv.finding_id && (
                      <Button
                        variant="white"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleOptimize(adv)}
                        icon={isBusy ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5 text-amber-500" />}
                      >
                        {isBusy ? "Patching..." : "1-Click Optimize"}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
