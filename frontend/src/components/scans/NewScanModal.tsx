import React, { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { FiPlay, FiLayers, FiFileText, FiRadio, FiCheckCircle } from "react-icons/fi";
import { TbShieldCheck, TbRadar2 } from "react-icons/tb";
import { Button } from "../ui/Button";
import { ScanType } from "../../types/scan";

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCompleted: (scanType: ScanType, target: string) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  onScanCompleted,
}) => {
  const [selectedType, setSelectedType] = useState<ScanType>("compose");
  const [targetPath, setTargetPath] = useState("./docker-compose.yml");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const progressBarRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<SVGSVGElement>(null);

  const targets: { type: ScanType; label: string; desc: string; defaultTarget: string; icon: any }[] = [
    {
      type: "compose",
      label: "Docker Compose",
      desc: "Audit services, ports, mounts, privileged mode, and capabilities in YAML",
      defaultTarget: "./docker-compose.yml",
      icon: FiLayers,
    },
    {
      type: "dockerfile",
      label: "Dockerfile",
      desc: "Inspect base image, non-root USER directive, healthchecks, and exposed ports",
      defaultTarget: "./Dockerfile",
      icon: FiFileText,
    },
    {
      type: "runtime",
      label: "Live Docker Daemon",
      desc: "Audit all running containers via Docker Engine API socket",
      defaultTarget: "unix:///var/run/docker.sock",
      icon: FiRadio,
    },
  ];

  const handleSelectType = (type: ScanType, defaultTarget: string) => {
    setSelectedType(type);
    setTargetPath(defaultTarget);
  };

  const handleStart = () => {
    setIsScanning(true);
    setScanStep("Discovery: Parsing target configurations...");

    if (progressBarRef.current) {
      const bar = { width: 0 };
      animate(bar, {
        width: 100,
        ease: "inOutQuad",
        duration: 2200,
        onUpdate: () => {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${bar.width}%`;
          }
          if (bar.width < 30) {
            setScanStep("Discovery: Locating container specs and volume mounts...");
          } else if (bar.width < 70) {
            setScanStep("Analysis: Evaluating 8 CIS Docker Benchmark security rules...");
          } else {
            setScanStep("Reporting: Normalizing findings & scoring hardening posture...");
          }
        },
        onComplete: () => {
          setTimeout(() => {
            setIsScanning(false);
            onScanCompleted(selectedType, targetPath);
            onClose();
          }, 300);
        },
      });
    }

    if (radarRef.current) {
      animate(radarRef.current, {
        rotate: [0, 720],
        ease: "linear",
        duration: 2200,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setScanStep("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-sentry-surface border border-sentry-border rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sentry-border bg-sentry-darkest/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <TbShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-sentry-text">Launch Security Audit</h3>
              <p className="text-[11px] text-sentry-muted">Select target resources to analyze for misconfigurations</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!isScanning ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-sentry-muted tracking-wider block">
                  Audit Target Type
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {targets.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedType === item.type;
                    return (
                      <div
                        key={item.type}
                        onClick={() => handleSelectType(item.type, item.defaultTarget)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-white"
                            : "bg-sentry-darkest/60 border-sentry-border hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`p-2 rounded shrink-0 ${
                            isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-sentry-surface text-sentry-muted"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-sentry-text">{item.label}</span>
                            {isSelected && <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-sentry-muted mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Path Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-sentry-muted tracking-wider block">
                  Path or Socket URI
                </label>
                <input
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded bg-sentry-darkest border border-sentry-border text-sentry-text focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          ) : (
            /* Animated Scan Progress View */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg
                  ref={radarRef}
                  className="w-20 h-20 text-emerald-500/30"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                  <line x1="50" y1="50" x2="50" y2="5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <TbRadar2 className="w-8 h-8 text-emerald-400 absolute" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-sentry-text tracking-wide">
                  Auditing Container Security Posture
                </h4>
                <p className="text-xs font-mono text-emerald-400 animate-pulse">
                  {scanStep}
                </p>
              </div>

              <div className="w-full bg-sentry-darkest rounded-full h-1.5 overflow-hidden border border-sentry-border">
                <div
                  ref={progressBarRef}
                  className="bg-emerald-500 h-full w-0 shadow-[0_0_10px_#10B981]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-sentry-border bg-sentry-darkest/40 flex items-center justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isScanning}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            disabled={isScanning}
            icon={<FiPlay className="w-3.5 h-3.5 fill-current" />}
          >
            {isScanning ? "Scanning..." : "Execute Audit"}
          </Button>
        </div>
      </div>
    </div>
  );
};
