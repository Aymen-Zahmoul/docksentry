import React, { useEffect, useState } from "react";
import { SecurityScoreGauge } from "../components/dashboard/SecurityScoreGauge";
import { StatMetricCards } from "../components/dashboard/StatMetricCards";
import { BklitBarChart, BklitBarItem } from "../components/ui/BklitChart";
import { BklitComplianceRadar } from "../components/ui/BklitComplianceRadar";
import { TopIssuesList } from "../components/dashboard/TopIssuesList";
import { RecentScansWidget } from "../components/dashboard/RecentScansWidget";
import { getDashboardStats } from "../services/dashboard.service";
import { getScans } from "../services/scans.service";
import { DashboardStats } from "../types/dashboard";
import { Scan } from "../types/scan";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, scansData] = await Promise.all([
          getDashboardStats(),
          getScans(),
        ]);
        setStats(statsData);
        setScans(scansData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-xs text-sentry-muted">
        <span className="animate-pulse">Loading DOCKSENTRY audit metrics...</span>
      </div>
    );
  }

  // Format Bklit UI Chart Items
  const bklitItems: BklitBarItem[] = [
    {
      id: "critical",
      label: "Critical",
      value: stats.findings_summary.critical,
      color: "#EF4444",
      sublabel: "Privileged / Sockets",
    },
    {
      id: "high",
      label: "High",
      value: stats.findings_summary.high,
      color: "#F97316",
      sublabel: "Root / Capabilities",
    },
    {
      id: "medium",
      label: "Medium",
      value: stats.findings_summary.medium,
      color: "#F59E0B",
      sublabel: "0.0.0.0 / Writable FS",
    },
    {
      id: "low",
      label: "Low",
      value: stats.findings_summary.low,
      color: "#3B82F6",
      sublabel: "Healthchecks",
    },
    {
      id: "info",
      label: "Info",
      value: stats.findings_summary.info,
      color: "#64748B",
      sublabel: "Best Practices",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-sentry-text">
          Security Posture Overview
        </h1>
        <p className="text-xs text-sentry-muted mt-1">
          Automated container configuration audit across Dockerfiles, Compose specs, and running daemons.
        </p>
      </div>

      {/* Security Hardening Score Banner */}
      <SecurityScoreGauge score={stats.security_score} />

      {/* 4 Stat Metric Cards */}
      <StatMetricCards stats={stats} />

      {/* Bklit UI Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BklitBarChart
          items={bklitItems}
          title="Bklit Telemetry: Findings by Severity"
          subtitle="Real-time configuration risk distribution"
        />
        <BklitComplianceRadar />
      </div>

      {/* Top Issues List & Recent Scans Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopIssuesList issues={stats.top_issues} />
        <RecentScansWidget scans={scans} />
      </div>
    </div>
  );
};
