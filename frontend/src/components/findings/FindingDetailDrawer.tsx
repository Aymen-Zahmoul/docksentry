import React, { useState, useEffect } from "react";
import {
  FiAlertCircle,
  FiTerminal,
  FiTool,
  FiBookOpen,
  FiExternalLink,
  FiCheckCircle,
  FiLayers,
  FiFileText,
  FiX,
  FiShield,
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiZap,
  FiRotateCcw,
  FiRefreshCw,
} from "react-icons/fi";
import { SiDocker } from "react-icons/si";
import { TbShieldExclamation, TbShieldCheck } from "react-icons/tb";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../ui/shadcn/drawer";
import { SeverityBadge, StatusBadge } from "../ui/Badge";
import { CodeDiffViewer } from "../ui/CodeDiffViewer";
import { Button } from "../ui/Button";
import { Finding, FindingStatus } from "../../types/finding";
import { remediateFinding, rollbackFinding } from "../../services/findings.service";

interface FindingDetailDrawerProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: FindingStatus) => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({
  finding,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<"diagnostic" | "remediation" | "compliance">("diagnostic");
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [currentFinding, setCurrentFinding] = useState<Finding | null>(finding);
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationMsg, setRemediationMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentFinding(finding);
    setRemediationMsg(null);
  }, [finding]);

  if (!currentFinding) return null;

  const resourceIcon = {
    dockerfile: FiFileText,
    compose_service: FiLayers,
    container: SiDocker,
  }[currentFinding.resource_type];

  const Icon = resourceIcon || FiTerminal;

  const getAuraColor = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "from-red-500/15 via-red-500/5";
      case "HIGH":
        return "from-orange-500/15 via-orange-500/5";
      case "MEDIUM":
        return "from-amber-500/15 via-amber-500/5";
      default:
        return "from-blue-500/15 via-blue-500/5";
    }
  };

  const handleCopyEvidence = () => {
    navigator.clipboard.writeText(currentFinding.evidence);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2000);
  };

  const handleApplyFix = async () => {
    if (!currentFinding) return;
    setIsRemediating(true);
    setRemediationMsg(null);
    try {
      const res = await remediateFinding(currentFinding.id);
      if (res.finding) {
        setCurrentFinding(res.finding);
        setRemediationMsg(res.message);
        if (onStatusChange) onStatusChange(currentFinding.id, "RESOLVED");
      }
    } catch (err: any) {
      setRemediationMsg(err.message || "Failed to apply remediation.");
    } finally {
      setIsRemediating(false);
    }
  };

  const handleRollback = async () => {
    if (!currentFinding) return;
    setIsRemediating(true);
    setRemediationMsg(null);
    try {
      const res = await rollbackFinding(currentFinding.id);
      if (res.finding) {
        setCurrentFinding(res.finding);
        setRemediationMsg(res.message);
        if (onStatusChange) onStatusChange(currentFinding.id, "OPEN");
      }
    } catch (err: any) {
      setRemediationMsg(err.message || "Failed to rollback.");
    } finally {
      setIsRemediating(false);
    }
  };

  const isResolved = currentFinding.status === "RESOLVED";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent width="2xl">
        {/* Ambient Top Glow Aura */}
        <div
          className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${getAuraColor(
            currentFinding.severity
          )} to-transparent pointer-events-none opacity-80 z-0`}
        />

        {/* Drawer Header */}
        <DrawerHeader className="relative z-10">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                {currentFinding.rule_id}
              </span>
              <SeverityBadge severity={currentFinding.severity} size="sm" />
              <StatusBadge status={currentFinding.status} />
              {currentFinding.auto_fixable && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <FiZap className="w-3 h-3 text-amber-400" />
                  <span>1-Click Fix</span>
                </span>
              )}
            </div>
            <DrawerTitle className="truncate text-base font-bold text-white">
              {currentFinding.title}
            </DrawerTitle>
          </div>

          <DrawerClose asChild>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Target Resource Origin Card */}
        <div className="px-6 pt-4 pb-2 relative z-10">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.06] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-slate-950 border border-white/[0.08] text-emerald-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Target: {currentFinding.resource_type}
                </span>
                <span className="font-semibold text-white truncate block">
                  {currentFinding.resource}
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 shrink-0">
              <span>{currentFinding.source}</span>
              {currentFinding.line ? <span className="text-emerald-400"> : line {currentFinding.line}</span> : null}
            </div>
          </div>
        </div>

        {/* Fluid Tab Selector */}
        <div className="px-6 pt-2 pb-1 border-b border-white/[0.05] flex gap-2 relative z-10 text-xs font-mono">
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "diagnostic"
                ? "border-emerald-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Threat Diagnostic
          </button>
          <button
            onClick={() => setActiveTab("remediation")}
            className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "remediation"
                ? "border-emerald-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Remediation & 1-Click Fix
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "compliance"
                ? "border-emerald-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            CIS Reference
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 relative z-10">
          {activeTab === "diagnostic" && (
            <div className="space-y-4">
              {/* 1. What was detected */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <FiAlertCircle className="w-4 h-4 text-emerald-400" />
                  <span>Detected Insecurity</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-200 leading-relaxed">
                  {currentFinding.message}
                </div>
              </div>

              {/* 2. Exact Configuration Evidence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-2">
                    <FiTerminal className="w-4 h-4 text-orange-400" />
                    <span>Configuration Evidence</span>
                  </div>
                  <button
                    onClick={handleCopyEvidence}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedEvidence ? (
                      <>
                        <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-orange-500/20 font-mono text-xs text-orange-300 overflow-x-auto">
                  <code>{currentFinding.evidence}</code>
                </div>
              </div>

              {/* 3. Security Risk & Attack Path */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <TbShieldExclamation className="w-4 h-4 text-red-400" />
                  <span>Attack Vector & Breakout Risk</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-950/15 border border-red-500/20 text-xs text-red-100/90 leading-relaxed space-y-3">
                  <p>{currentFinding.why_it_matters}</p>

                  {/* Visual Threat Path Flow */}
                  <div className="pt-2 border-t border-red-500/20 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-red-500/30 text-red-300">
                      Container Namespace
                    </span>
                    <FiArrowRight className="w-3.5 h-3.5 text-red-400" />
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-red-500/30 text-red-300">
                      Escalation Vector
                    </span>
                    <FiArrowRight className="w-3.5 h-3.5 text-red-400" />
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500 text-white font-bold">
                      Host Root Compromise
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "remediation" && (
            <div className="space-y-4">
              {/* 1-Click Auto-Remediation Control Card */}
              {currentFinding.auto_fixable && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                      : "bg-slate-900/60 border-amber-500/30 text-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FiZap className={`w-4 h-4 ${isResolved ? "text-emerald-400" : "text-amber-400"}`} />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          {isResolved ? "Remediation Applied" : "1-Click Auto-Remediation Available"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {isResolved
                          ? "Hardening patch has been applied to disk. An atomic backup (.docksentry.bak) was preserved."
                          : `Surgically patches ${currentFinding.resource} directly on disk with safety backup.`}
                      </p>
                      {remediationMsg && (
                        <div className="text-[11px] font-mono text-emerald-400 pt-1">
                          ✓ {remediationMsg}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isResolved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRemediating}
                          onClick={handleRollback}
                          icon={isRemediating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiRotateCcw className="w-3.5 h-3.5" />}
                        >
                          {isRemediating ? "Reverting..." : "Undo / Rollback"}
                        </Button>
                      ) : (
                        <Button
                          variant="white"
                          size="sm"
                          disabled={isRemediating}
                          onClick={handleApplyFix}
                          icon={isRemediating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5 text-amber-500" />}
                        >
                          {isRemediating ? "Patching..." : "⚡ Apply 1-Click Fix"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <FiTool className="w-4 h-4 text-emerald-400" />
                  <span>Hardening Guide</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentFinding.remediation}</p>
              </div>

              {currentFinding.code_diff && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Side-by-Side Configuration Diff
                  </div>
                  <CodeDiffViewer diff={currentFinding.code_diff} />
                </div>
              )}
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <FiShield className="w-4 h-4 text-blue-400" />
                  <span>CIS Docker Benchmark Specification</span>
                </div>
                <div className="space-y-1 text-slate-400 leading-relaxed">
                  <div>
                    Benchmark Rule: <span className="text-white font-bold">{currentFinding.rule_id}</span>
                  </div>
                  <div>
                    Category: <span className="text-slate-200">{currentFinding.category}</span>
                  </div>
                  <div>
                    Standard Version: <span className="text-slate-200">CIS Docker Benchmark v1.6.0</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/[0.05]">
                  <a
                    href={currentFinding.documentation_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Read Official Docker Security Documentation</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-slate-900/40 backdrop-blur-md flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 font-mono text-xs">
            {currentFinding.auto_fixable && !isResolved && (
              <Button
                variant="white"
                size="sm"
                disabled={isRemediating}
                onClick={handleApplyFix}
                icon={isRemediating ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5 text-amber-500" />}
              >
                {isRemediating ? "Applying..." : "Auto-Fix"}
              </Button>
            )}

            {onStatusChange && (
              <>
                {!isResolved && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onStatusChange(currentFinding.id, "RESOLVED");
                      onClose();
                    }}
                    icon={<FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    Mark Resolved
                  </Button>
                )}
                {currentFinding.status !== "IGNORED" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onStatusChange(currentFinding.id, "IGNORED");
                      onClose();
                    }}
                  >
                    Ignore Rule
                  </Button>
                )}
              </>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FindingDetailDrawer;
