import React, { useEffect, useState } from "react";
import { PostureHorizon } from "../components/dashboard/PostureHorizon";
import { RiskSpectrum } from "../components/dashboard/RiskSpectrum";
import { HardeningPostureList } from "../components/dashboard/HardeningPostureList";
import { FluidIssuesStream } from "../components/dashboard/FluidIssuesStream";
import { FluidRecentScans } from "../components/dashboard/FluidRecentScans";
import { FindingDetailDrawer } from "../components/findings/FindingDetailDrawer";
import { getDashboardStats } from "../services/dashboard.service";
import { getScans } from "../services/scans.service";
import { getFindings, updateFindingStatus } from "../services/findings.service";
import { DashboardStats } from "../types/dashboard";
import { Scan } from "../types/scan";
import { Finding, FindingStatus } from "../types/finding";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [statsData, scansData, findingsData] = await Promise.all([
        getDashboardStats(),
        getScans(),
        getFindings(),
      ]);
      setStats(statsData);
      setScans(scansData);
      setFindings(findingsData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectRule = (ruleId: string) => {
    const matching = findings.find((f) => f.rule_id === ruleId);
    if (matching) {
      setSelectedFinding(matching);
      setIsDrawerOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: FindingStatus) => {
    try {
      const updated = await updateFindingStatus(id, status);
      setFindings((prev) => prev.map((f) => (f.id === id ? updated : f)));
      if (selectedFinding?.id === id) {
        setSelectedFinding(updated);
      }
      // Refresh stats
      const statsData = await getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to update finding status:", err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400">
        <span className="animate-pulse">Loading DOCKSENTRY audit metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Security Posture
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time hardening telemetry across Dockerfiles, Compose services, and container runtime sockets.
        </p>
      </div>

      {/* 1. Fluid Master Hero: Posture Horizon + Borderless Telemetry Ribbon */}
      <PostureHorizon stats={stats} />

      {/* 2. Option A: Asymmetric Command Cockpit (2-Column Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Primary Telemetry & Hardening Posture: 7 cols / ~58%) */}
        <div className="lg:col-span-7 space-y-6">
          <RiskSpectrum summary={stats.findings_summary} />
          <HardeningPostureList categories={stats.category_posture || []} />
        </div>

        {/* Right Column (Live Threat Feed & Execution Timeline: 5 cols / ~42%) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <FluidIssuesStream
            issues={stats.top_issues}
            onSelectRule={handleSelectRule}
          />
          <FluidRecentScans scans={scans} />
        </div>
      </div>

      {/* 5. Stunning Slide-in Inspection Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default DashboardPage;
