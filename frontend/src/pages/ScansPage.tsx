import React, { useEffect, useState } from "react";
import { FiPlay, FiClock, FiFileText, FiLayers, FiRadio, FiCheckCircle } from "react-icons/fi";
import { TbShieldCheck } from "react-icons/tb";
import { Button } from "../components/ui/Button";
import { NewScanModal } from "../components/scans/NewScanModal";
import { getScans, startScan } from "../services/scans.service";
import { Scan, ScanType } from "../types/scan";

export const ScansPage: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadScans = async () => {
    try {
      const data = await getScans();
      setScans(data);
    } catch (err) {
      console.error("Failed to load scans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleScanCompleted = async (scanType: ScanType, target: string) => {
    await startScan({ scan_type: scanType, target });
    await loadScans();
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "compose":
        return FiLayers;
      case "dockerfile":
        return FiFileText;
      case "runtime":
        return FiRadio;
      default:
        return TbShieldCheck;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-sentry-text">
            Security Audit History
          </h1>
          <p className="text-xs text-sentry-muted mt-1">
            Historical audit logs, scanned artifacts, and security assessment execution times.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<FiPlay className="w-3.5 h-3.5 fill-current" />}
        >
          Run New Audit
        </Button>
      </div>

      {/* Scans Table */}
      <div className="rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sentry-border bg-sentry-darkest/60 text-[11px] font-mono text-sentry-muted uppercase tracking-wider">
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Findings Breakdown</th>
                <th className="py-3 px-4">Initiated By</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentry-border/50 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sentry-muted">
                    Loading scan audit trail...
                  </td>
                </tr>
              ) : scans.map((scan) => {
                const Icon = getTargetIcon(scan.scan_type);
                return (
                  <tr key={scan.id} className="hover:bg-sentry-surface-hover/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      {scan.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-sentry-muted shrink-0" />
                        <span className="font-semibold text-sentry-text">{scan.target}</span>
                      </div>
                      <div className="text-[10px] text-sentry-muted mt-0.5">
                        {new Date(scan.started_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 uppercase text-sentry-muted whitespace-nowrap">
                      {scan.scan_type}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-sentry-text">
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-sentry-muted" />
                        {scan.duration_seconds}s
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-red-400 font-bold">{scan.findings_count.critical}C</span>
                        <span className="text-orange-400 font-bold">{scan.findings_count.high}H</span>
                        <span className="text-amber-400 font-bold">{scan.findings_count.medium}M</span>
                        <span className="text-blue-400">{scan.findings_count.low}L</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-sentry-muted whitespace-nowrap">
                      {scan.initiated_by}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScanCompleted={handleScanCompleted}
      />
    </div>
  );
};
