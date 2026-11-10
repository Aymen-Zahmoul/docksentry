import React from "react";
import { Link } from "react-router-dom";
import { SiDocker } from "react-icons/si";
import { FiExternalLink } from "react-icons/fi";
import { TbShieldCheck, TbShieldExclamation } from "react-icons/tb";
import { Container } from "../../types/container";

interface ContainersTableProps {
  containers: Container[];
}

export const ContainersTable: React.FC<ContainersTableProps> = ({ containers }) => {
  return (
    <div className="rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Container & Image</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">User Context</th>
              <th className="py-3 px-4">Privileged</th>
              <th className="py-3 px-4">Root FS</th>
              <th className="py-3 px-4">Published Ports</th>
              <th className="py-3 px-4">Findings</th>
              <th className="py-3 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
            {containers.map((c) => {
              const totalIssues =
                c.findings_count.critical +
                c.findings_count.high +
                c.findings_count.medium +
                c.findings_count.low;

              return (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Name & Image */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <SiDocker className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div className="font-semibold text-slate-100">{c.name}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px] ml-5.5">
                      {c.image}
                    </div>
                  </td>

                  {/* State */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {c.status}
                    </span>
                  </td>

                  {/* User Context */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.is_root ? (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                        root (UID 0)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.user}
                      </span>
                    )}
                  </td>

                  {/* Privileged */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.privileged ? (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
                        Privileged
                      </span>
                    ) : (
                      <span className="text-slate-400">false</span>
                    )}
                  </td>

                  {/* Read-Only Rootfs */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.read_only_rootfs ? (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Read-Only
                      </span>
                    ) : (
                      <span className="text-amber-400/90 text-[11px]">
                        Writable
                      </span>
                    )}
                  </td>

                  {/* Ports */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.ports.length > 0 ? (
                      c.ports.map((p, idx) => (
                        <div
                          key={idx}
                          className={`text-[11px] ${
                            p.is_public ? "text-amber-400" : "text-slate-400"
                          }`}
                        >
                          {p.host_ip}:{p.host_port} → {p.container_port}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">Internal only</span>
                    )}
                  </td>

                  {/* Findings */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {totalIssues > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                        <TbShieldExclamation className="w-4 h-4" />
                        {totalIssues} issue{totalIssues === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <TbShieldCheck className="w-4 h-4" />
                        Clean
                      </span>
                    )}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={`/findings?search=${encodeURIComponent(c.name)}`}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <span>View Findings</span>
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
