import React, { useEffect, useState } from "react";
import { SiDocker } from "react-icons/si";
import { TbShieldExclamation } from "react-icons/tb";
import { ContainersTable } from "../components/containers/ContainersTable";
import { getContainers } from "../services/containers.service";
import { Container } from "../types/container";

export const ContainersPage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContainers();
        setContainers(data);
      } catch (err) {
        console.error("Failed to load containers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const runningCount = containers.filter((c) => c.status === "running").length;
  const rootCount = containers.filter((c) => c.is_root).length;
  const privilegedCount = containers.filter((c) => c.privileged).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-sentry-text">
          Container Inventory
        </h1>
        <p className="text-xs text-sentry-muted mt-1">
          Active and stopped container environments discovered on the local Docker engine.
        </p>
      </div>

      {/* Summary KPI chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border flex items-center justify-between">
          <div>
            <span className="text-sentry-muted uppercase tracking-wider text-[10px] block">
              Active Workloads
            </span>
            <span className="text-xl font-bold text-sentry-text mt-1 block">
              {runningCount} / {containers.length}
            </span>
          </div>
          <SiDocker className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border flex items-center justify-between">
          <div>
            <span className="text-sentry-muted uppercase tracking-wider text-[10px] block">
              Running as Root (UID 0)
            </span>
            <span className="text-xl font-bold text-orange-400 mt-1 block">
              {rootCount} containers
            </span>
          </div>
          <TbShieldExclamation className="w-5 h-5 text-orange-400" />
        </div>

        <div className="p-4 rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border flex items-center justify-between">
          <div>
            <span className="text-sentry-muted uppercase tracking-wider text-[10px] block">
              Privileged Containers
            </span>
            <span className="text-xl font-bold text-red-400 mt-1 block">
              {privilegedCount} critical
            </span>
          </div>
          <TbShieldExclamation className="w-5 h-5 text-red-400" />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-sentry-muted">
          Inspecting Docker daemon containers...
        </div>
      ) : (
        <ContainersTable containers={containers} />
      )}
    </div>
  );
};
