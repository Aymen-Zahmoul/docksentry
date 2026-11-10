import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FindingsTable } from "../components/findings/FindingsTable";
import { FindingDetailDrawer } from "../components/findings/FindingDetailDrawer";
import { getFindings, updateFindingStatus } from "../services/findings.service";
import { Finding, FindingStatus } from "../types/finding";

export const FindingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFindings = async () => {
    try {
      const data = await getFindings();
      setFindings(data);
    } catch (err) {
      console.error("Failed to load findings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (id: string, status: FindingStatus) => {
    try {
      const updated = await updateFindingStatus(id, status);
      setFindings((prev) => prev.map((f) => (f.id === id ? updated : f)));
      if (selectedFinding?.id === id) {
        setSelectedFinding(updated);
      }
    } catch (err) {
      console.error("Failed to update finding status:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-sentry-text">
          Security Findings
        </h1>
        <p className="text-xs text-sentry-muted mt-1">
          Insecure configuration patterns detected against the CIS Docker Benchmark.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-sentry-muted">
          Loading security findings...
        </div>
      ) : (
        <FindingsTable
          findings={findings}
          onSelectFinding={handleSelectFinding}
          initialSearch={initialSearch}
        />
      )}

      {/* The Signature Educational Finding Detail Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
