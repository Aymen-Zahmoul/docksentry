import React, { useState } from "react";
import { FiDownload, FiCheck, FiFileText } from "react-icons/fi";
import { TbReportAnalytics, TbShieldCheck } from "react-icons/tb";
import { VscJson } from "react-icons/vsc";
import { Button } from "../components/ui/Button";
import { mockFindings, mockDashboardStats } from "../mocks/data";

export const ReportsPage: React.FC = () => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string, type: string, formatKey: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedFormat(formatKey);
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const handleExportJSON = () => {
    const data = {
      product: "DOCKSENTRY",
      version: "1.0.0",
      generated_at: new Date().toISOString(),
      score: mockDashboardStats.security_score,
      summary: mockDashboardStats.findings_summary,
      findings: mockFindings,
    };
    downloadFile(
      `docksentry-audit-${Date.now()}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
      "json"
    );
  };

  const handleExportSARIF = () => {
    const sarif = {
      $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "DOCKSENTRY",
              informationUri: "https://github.com/Aymen-Zahmoul/docksentry",
              rules: mockFindings.map((f) => ({
                id: f.rule_id,
                name: f.title,
                shortDescription: { text: f.message },
                helpUri: f.documentation_url,
                defaultConfiguration: {
                  level: f.severity === "CRITICAL" || f.severity === "HIGH" ? "error" : "warning",
                },
              })),
            },
          },
          results: mockFindings.map((f) => ({
            ruleId: f.rule_id,
            message: { text: f.message },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.source },
                  region: { startLine: f.line || 1 },
                },
              },
            ],
          })),
        },
      ],
    };
    downloadFile(
      `docksentry-audit-${Date.now()}.sarif`,
      JSON.stringify(sarif, null, 2),
      "application/json",
      "sarif"
    );
  };

  const handleExportMarkdown = () => {
    let md = `# DOCKSENTRY Security Assessment Report\n\n`;
    md += `**Generated:** ${new Date().toUTCString()}\n`;
    md += `**Hardening Score:** ${mockDashboardStats.security_score} / 100\n\n`;
    md += `## Findings Summary\n\n`;
    md += `- **Critical:** ${mockDashboardStats.findings_summary.critical}\n`;
    md += `- **High:** ${mockDashboardStats.findings_summary.high}\n`;
    md += `- **Medium:** ${mockDashboardStats.findings_summary.medium}\n`;
    md += `- **Low:** ${mockDashboardStats.findings_summary.low}\n\n`;
    md += `## Detailed Findings\n\n`;
    mockFindings.forEach((f) => {
      md += `### [${f.rule_id}] ${f.title} (${f.severity})\n\n`;
      md += `* **Target:** \`${f.resource}\` (${f.source})\n`;
      md += `* **Risk:** ${f.why_it_matters}\n`;
      md += `* **Evidence:** \`${f.evidence}\`\n`;
      md += `* **Remediation:** ${f.remediation}\n\n`;
    });

    downloadFile(
      `docksentry-audit-${Date.now()}.md`,
      md,
      "text/markdown",
      "md"
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Security Assessment Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate, export, and download compliance audits in industry-standard formats.
        </p>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SARIF 2.1.0 */}
        <div className="p-5 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TbReportAnalytics className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">SARIF 2.1.0 Export</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard format for GitHub Code Scanning, GitLab Security Dashboard, and CI/CD security gating pipelines.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSARIF}
            icon={downloadedFormat === "sarif" ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiDownload className="w-3.5 h-3.5" />}
          >
            {downloadedFormat === "sarif" ? "Exported SARIF" : "Download SARIF"}
          </Button>
        </div>

        {/* JSON Raw Feed */}
        <div className="p-5 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <VscJson className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-100">Raw JSON Report</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full structured output with code snippets, evidence, category mappings, and raw AST locations for API consumption.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            icon={downloadedFormat === "json" ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiDownload className="w-3.5 h-3.5" />}
          >
            {downloadedFormat === "json" ? "Exported JSON" : "Download JSON"}
          </Button>
        </div>

        {/* Markdown Brief */}
        <div className="p-5 rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">Markdown Briefing</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Human-readable summary ideal for pull request descriptions, security audit meetings, and issue trackers.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportMarkdown}
            icon={downloadedFormat === "md" ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiDownload className="w-3.5 h-3.5" />}
          >
            {downloadedFormat === "md" ? "Exported MD" : "Download Markdown"}
          </Button>
        </div>
      </div>

      {/* Historical Assessment Card */}
      <div className="p-6 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TbShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Latest Assessment Record</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Report ID: RPT-2026-11-10-042
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Target Workspace:</span>
            <span className="text-slate-200">docker-compose.yml + Dockerfile.api</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Violations Flagged:</span>
            <span className="text-slate-200">8 Insecure Configurations</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Benchmark Baseline:</span>
            <span className="text-emerald-400">CIS Docker Benchmark v1.6.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Audited At:</span>
            <span>2026-11-10 14:15:00 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
