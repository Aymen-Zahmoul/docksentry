import React, { useEffect, useState } from "react";
import { SiDocker } from "react-icons/si";
import { TbShieldExclamation } from "react-icons/tb";
import { FiAlertTriangle } from "react-icons/fi";
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Container Inventory
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Discovered workloads, runtime isolation flags, and port bindings on the Docker engine.
        </p>
      </div>

      {/* Fluid Telemetry Ribbon */}
      <div className="rounded-2xl bg-slate-900/30 backdrop-blur-md border border-white/[0.05] p-5 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05] gap-4 sm:gap-0 font-mono text-xs">
        <div className="sm:px-6 first:pl-0 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
              Active Workloads
            </span>
            <span className="text-xl font-bold text-white mt-0.5 block">
              {runningCount} / {containers.length}
            </span>
          </div>
          <SiDocker className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="sm:px-6 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
              Running as Root (UID 0)
            </span>
            <span className="text-xl font-bold text-orange-400 mt-0.5 block">
              {rootCount} container{rootCount === 1 ? "" : "s"}
            </span>
          </div>
          <TbShieldExclamation className="w-5 h-5 text-orange-400" />
        </div>

        <div className="sm:px-6 last:pr-0 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
              Privileged Mode
            </span>
            <span className="text-xl font-bold text-red-400 mt-0.5 block">
              {privilegedCount} critical
            </span>
          </div>
          <FiAlertTriangle className="w-5 h-5 text-red-400" />
        </div>
      </div>

      {/* Containers Table */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-400">
          Loading container inventory...
        </div>
      ) : (
        <ContainersTable containers={containers} />
      )}
    </div>
  );
};

export default ContainersPage;
