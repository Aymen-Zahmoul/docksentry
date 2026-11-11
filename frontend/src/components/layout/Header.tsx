import React from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiChevronDown, FiFolder, FiCheck } from "react-icons/fi";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/shadcn/dropdown-menu";

interface HeaderProps {
  onOpenNewScan: () => void;
  selectedTarget?: string;
  onSelectTarget?: (target: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewScan,
  selectedTarget = "docker-compose.yml",
  onSelectTarget,
}) => {
  const targets = [
    { label: "docker-compose.yml", type: "Compose File" },
    { label: "Dockerfile.api", type: "Backend Image Spec" },
    { label: "Dockerfile.frontend", type: "Web Image Spec" },
    { label: "unix:///var/run/docker.sock", type: "Local Daemon" },
  ];

  return (
    <header className="h-16 px-6 bg-sentry-surface/70 backdrop-blur-xl border-b border-sentry-border/80 flex items-center justify-between shrink-0 z-20">
      {/* Left: Brand Identity + Target Selector */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center overflow-hidden group-hover:border-slate-500 transition-all shadow-sm">
            <img
              src="/docksentry-emblem.svg"
              alt="DOCKSENTRY"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-widest text-sentry-text">
              DOCKSENTRY
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              v1.0
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-sentry-border hidden sm:block" />

        {/* Target Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sentry-darkest/80 border border-sentry-border hover:border-emerald-500/40 text-xs text-sentry-text transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <FiFolder className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sentry-muted">Target:</span>
              <span className="font-mono font-medium text-emerald-300">{selectedTarget}</span>
              <FiChevronDown className="w-3.5 h-3.5 text-sentry-muted" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Audit Target Spec</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {targets.map((t) => (
              <DropdownMenuItem
                key={t.label}
                onClick={() => onSelectTarget && onSelectTarget(t.label)}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-[10px] text-sentry-muted">{t.type}</div>
                </div>
                {selectedTarget === t.label && (
                  <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Quick Action Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="white"
          size="sm"
          onClick={onOpenNewScan}
          icon={<FiPlay className="w-3 h-3 fill-current" />}
          className="font-mono tracking-tight text-xs px-3.5 py-1.5 font-semibold"
        >
          Start Audit
        </Button>
      </div>
    </header>
  );
};
