import React from "react";
import {
  FiAlertCircle,
  FiTerminal,
  FiHelpCircle,
  FiTool,
  FiBookOpen,
  FiExternalLink,
  FiCheckCircle,
  FiEyeOff,
  FiLayers,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { SiDocker } from "react-icons/si";
import { TbShieldExclamation } from "react-icons/tb";
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

interface FindingDetailDrawerProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: FindingStatus) => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({
  finding,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!finding) return null;

  const resourceIcon = {
    dockerfile: FiFileText,
    compose_service: FiLayers,
    container: SiDocker,
  }[finding.resource_type];

  const Icon = resourceIcon || FiTerminal;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent width="2xl">
        {/* shadcn Drawer Header */}
        <DrawerHeader>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                {finding.rule_id}
              </span>
              <DrawerTitle className="truncate max-w-md">
                {finding.title}
              </DrawerTitle>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <SeverityBadge severity={finding.severity} size="sm" />
              <StatusBadge status={finding.status} />
              <span className="text-sentry-muted font-mono text-[11px]">
                Category: {finding.category}
              </span>
            </div>
          </div>

          <DrawerClose asChild>
            <button className="p-1.5 rounded-md text-sentry-text-dim hover:text-sentry-text hover:bg-white/5 transition-colors focus:outline-none">
              <FiX className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Affected Resource & File Origin Bar */}
          <div className="p-3.5 rounded-lg border border-sentry-border bg-sentry-darkest/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-sentry-surface border border-sentry-border text-emerald-400">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-sentry-muted font-mono uppercase tracking-wider">
                  Target Resource
                </div>
                <div className="font-mono text-xs font-semibold text-sentry-text">
                  {finding.resource}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-sentry-muted font-mono uppercase tracking-wider">
                Source Location
              </div>
              <div className="font-mono text-xs text-sentry-text-dim">
                {finding.source}
                {finding.line ? ` : line ${finding.line}` : ""}
              </div>
            </div>
          </div>

          {/* 1. What is the Security Problem? */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sentry-muted">
              <FiAlertCircle className="w-4 h-4 text-emerald-400" />
              <span>01. Detected Insecure Configuration</span>
            </div>
            <p className="text-sentry-text leading-relaxed bg-sentry-darkest/40 p-3.5 rounded-lg border border-sentry-border/60">
              {finding.message}
            </p>
          </div>

          {/* 2. Exact Evidence Detected */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sentry-muted">
              <FiTerminal className="w-4 h-4 text-orange-400" />
              <span>02. Detected Configuration Evidence</span>
            </div>
            <div className="font-mono text-xs p-3 rounded-lg bg-sentry-darkest border border-orange-500/20 text-orange-300">
              <code>{finding.evidence}</code>
            </div>
          </div>

          {/* 3. Why It Matters (The Security Risk & Attack Vector) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sentry-muted">
              <TbShieldExclamation className="w-4 h-4 text-red-400" />
              <span>03. Why This Matters (Security Impact)</span>
            </div>
            <div className="text-xs text-sentry-text leading-relaxed bg-red-950/10 p-3.5 rounded-lg border border-red-500/20 text-red-100/90 space-y-2">
              <p>{finding.why_it_matters}</p>
            </div>
          </div>

          {/* 4. Actionable Remediation & Configuration Diff */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sentry-muted">
              <FiTool className="w-4 h-4 text-emerald-400" />
              <span>04. Remediation & Hardening Guide</span>
            </div>
            <p className="text-xs text-sentry-text-dim mb-2">{finding.remediation}</p>

            {finding.code_diff && <CodeDiffViewer diff={finding.code_diff} />}
          </div>

          {/* 5. Standards & Documentation Reference */}
          <div className="space-y-2 pt-2 border-t border-sentry-border">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sentry-muted flex items-center gap-1.5">
                <FiBookOpen className="w-3.5 h-3.5 text-blue-400" />
                Standard Reference:
              </span>
              <span className="text-blue-400 font-semibold">
                {finding.cis_reference || "CIS Docker Benchmark"}
              </span>
            </div>

            <a
              href={finding.documentation_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Read official Docker security hardening documentation</span>
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Controls */}
          <div className="pt-4 border-t border-sentry-border flex items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-sentry-muted">
              Audit Date: {new Date(finding.detected_at).toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              {finding.status !== "IGNORED" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(finding.id, "IGNORED")}
                  icon={<FiEyeOff className="w-3.5 h-3.5" />}
                >
                  Ignore
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(finding.id, "OPEN")}
                >
                  Re-open
                </Button>
              )}

              {finding.status !== "RESOLVED" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onStatusChange(finding.id, "RESOLVED")}
                  icon={<FiCheckCircle className="w-3.5 h-3.5" />}
                >
                  Mark Resolved
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onStatusChange(finding.id, "OPEN")}
                >
                  Mark Open
                </Button>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
