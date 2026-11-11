import React, { useState, useEffect, useRef } from "react";
import {
  FiPlay,
  FiLayers,
  FiFileText,
  FiRadio,
  FiCheckCircle,
  FiX,
  FiStopCircle,
} from "react-icons/fi";
import { TbShieldCheck } from "react-icons/tb";
import { Button } from "../ui/Button";
import { CloudButton } from "../ui/CloudButton";
import { Component as Loader3D } from "../ui/loader-3";
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
  const [progress, setProgress] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const timerRef = useRef<any>(null);

  const targets: {
    type: ScanType;
    label: string;
    desc: string;
    defaultTarget: string;
    icon: any;
  }[] = [
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
    setProgress(0);
    setScanStep("Discovery: Locating container specs and volume mounts...");

    if (timerRef.current) clearInterval(timerRef.current);

    let current = 0;
    timerRef.current = setInterval(() => {
      // Proportional incremental progression
      current += Math.floor(Math.random() * 4) + 2; // ~2-5% increments
      if (current >= 100) {
        current = 100;
        clearInterval(timerRef.current);
        timerRef.current = null;
        setProgress(100);
        setScanStep("Completed! Synthesizing vulnerability findings...");

        setTimeout(() => {
          setIsScanning(false);
          setProgress(0);
          onScanCompleted(selectedType, targetPath);
          onClose();
        }, 500);
      } else {
        setProgress(current);
        if (current < 25) {
          setScanStep("Discovery: Parsing target configurations & dependencies...");
        } else if (current < 55) {
          setScanStep("Inspection: Checking non-root users, capabilities & mounts...");
        } else if (current < 85) {
          setScanStep("Policy Engine: Auditing 8 CIS Docker Benchmark controls...");
        } else {
          setScanStep("Synthesis: Normalizing findings & scoring hardening posture...");
        }
      }
    }, 60);
  };

  const handleCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsScanning(false);
    setProgress(0);
    setScanStep("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsScanning(false);
      setProgress(0);
      setScanStep("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TbShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Launch Security Audit
              </h3>
              <p className="text-[11px] text-slate-400">
                Analyze Docker configurations against CIS hardening benchmarks
              </p>
            </div>
          </div>

          {/* Close / Cancel Button */}
          <button
            onClick={handleCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Cancel and close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!isScanning ? (
            <>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                  Audit Target Type
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {targets.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedType === item.type;
                    return (
                      <div
                        key={item.type}
                        onClick={() =>
                          handleSelectType(item.type, item.defaultTarget)
                        }
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm"
                            : "bg-slate-950/50 border-white/[0.05] hover:border-white/[0.12]"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800/60 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200">
                              {item.label}
                            </span>
                            {isSelected && (
                              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Path Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                  Path or Socket URI
                </label>
                <input
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-slate-950/70 border border-white/[0.08] text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </>
          ) : (
            /* 3D Isometric Loader & Proportional Progress */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
              {/* 3D Isometric Box Loader */}
              <div className="h-40 flex items-center justify-center overflow-hidden">
                <Loader3D className="scale-90" />
              </div>

              <div className="space-y-1.5 w-full">
                <h4 className="text-sm font-semibold text-white tracking-wide">
                  Auditing Container Security Posture
                </h4>
                <p className="text-xs font-mono text-sky-400">
                  {scanStep}
                </p>
              </div>

              {/* Proportional Progress Bar with Percentage */}
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="text-slate-400 text-[11px]">Audit Execution</span>
                  <span className="text-sky-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/[0.08] relative">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Active In-Scan Cancellation Button */}
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                <FiStopCircle className="w-4 h-4" />
                Cancel Audit
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.06] bg-slate-950/60 flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          {!isScanning && (
            <CloudButton
              variant="cyan"
              size="sm"
              onClick={handleStart}
              icon={<FiPlay className="w-3.5 h-3.5 fill-current" />}
            >
              Execute Audit
            </CloudButton>
          )}
        </div>
      </div>
    </div>
  );
};
