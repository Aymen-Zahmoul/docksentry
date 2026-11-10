import React, { useState } from "react";
import { FiCheck, FiCopy, FiAlertTriangle } from "react-icons/fi";
import { TbShieldCheck } from "react-icons/tb";
import { CodeDiff } from "../../types/finding";

interface CodeDiffViewerProps {
  diff: CodeDiff;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diff }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diff.recommended);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Insecure Configuration Box */}
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-red-500/20 bg-red-950/30 text-red-300">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Insecure Configuration
            </span>
            <span className="text-[10px] text-red-400/80 uppercase">{diff.language}</span>
          </div>
          <pre className="p-3 text-red-200/90 overflow-x-auto whitespace-pre font-mono leading-relaxed">
            <code>{diff.insecure}</code>
          </pre>
        </div>

        {/* Recommended Configuration Box */}
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/20 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-emerald-500/20 bg-emerald-950/30 text-emerald-300">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide uppercase">
              <TbShieldCheck className="w-4 h-4 text-emerald-400" />
              Recommended Secure Fix
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded transition-colors"
              title="Copy recommended configuration"
            >
              {copied ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-3.5 h-3.5" />
                  <span>Copy Fix</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-emerald-200/90 overflow-x-auto whitespace-pre font-mono leading-relaxed">
            <code>{diff.recommended}</code>
          </pre>
        </div>
      </div>

      {/* Engineering Context & Trade-offs */}
      {diff.trade_offs && (
        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-200/90 text-xs font-sans flex items-start gap-2.5">
          <FiAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-amber-300 block mb-0.5">Engineering Trade-off</span>
            <p className="text-amber-200/80 leading-relaxed text-xs">{diff.trade_offs}</p>
          </div>
        </div>
      )}
    </div>
  );
};
