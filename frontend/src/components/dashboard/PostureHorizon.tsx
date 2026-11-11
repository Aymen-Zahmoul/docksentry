import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Link } from "react-router-dom";
import { TbShieldCheck, TbShieldExclamation } from "react-icons/tb";
import { SiDocker } from "react-icons/si";
import { FiFileText, FiAlertTriangle, FiArrowUpRight } from "react-icons/fi";
import { DashboardStats } from "../../types/dashboard";

interface PostureHorizonProps {
  stats: DashboardStats;
  onRunAudit?: () => void;
}

export const PostureHorizon: React.FC<PostureHorizonProps> = ({ stats, onRunAudit }) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const cRef = useRef<HTMLSpanElement>(null);
  const rRef = useRef<HTMLSpanElement>(null);
  const fRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.security_score / 100) * circumference;

  const totalFindings =
    stats.findings_summary.critical +
    stats.findings_summary.high +
    stats.findings_summary.medium +
    stats.findings_summary.low;

  const criticalAndHigh = stats.findings_summary.critical + stats.findings_summary.high;

  useEffect(() => {
    // Score number counter
    if (numberRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: stats.security_score,
        ease: "outExpo",
        duration: 1100,
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerHTML = String(Math.round(obj.val));
          }
        },
      });
    }

    // Circular arc animation
    if (circleRef.current) {
      animate(circleRef.current, {
        strokeDashoffset: [circumference, strokeDashoffset],
        ease: "outCubic",
        duration: 1200,
      });
    }

    // Telemetry counters
    const counters = [
      { el: cRef.current, val: stats.containers_running },
      { el: rRef.current, val: stats.scanned_resources },
      { el: fRef.current, val: totalFindings },
      { el: aRef.current, val: criticalAndHigh },
    ];

    counters.forEach(({ el, val }) => {
      if (!el) return;
      const c = { val: 0 };
      animate(c, {
        val,
        ease: "outQuad",
        duration: 900,
        onUpdate: () => {
          if (el) el.innerText = String(Math.round(c.val));
        },
      });
    });
  }, [stats.security_score, circumference, strokeDashoffset, totalFindings, criticalAndHigh, stats.containers_running, stats.scanned_resources]);

  const getAssessment = (s: number) => {
    if (s >= 90) {
      return {
        grade: "Grade A",
        title: "Hardened Posture",
        color: "text-emerald-400",
        stroke: "#10B981",
        diagnostic: "All static configs and daemon sockets satisfy CIS Docker Benchmark v1.6 guidelines.",
      };
    }
    if (s >= 75) {
      return {
        grade: "Grade B",
        title: "Good Isolation",
        color: "text-emerald-300",
        stroke: "#34D399",
        diagnostic: "Core isolation boundaries are intact with minor non-critical configuration improvements.",
      };
    }
    if (s >= 55) {
      return {
        grade: "Grade C",
        title: "Action Recommended",
        color: "text-amber-400",
        stroke: "#F59E0B",
        diagnostic: `${criticalAndHigh} elevated risks detected. Root process UID 0 and privileged parameters require attention.`,
      };
    }
    return {
      grade: "Grade F",
      title: "Severe Exposure",
      color: "text-red-400",
      stroke: "#EF4444",
      diagnostic: `${stats.findings_summary.critical} critical misconfigurations active. Docker socket mounts or privileged containers exposed.`,
    };
  };

  const assessment = getAssessment(stats.security_score);

  return (
    <div className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.07] p-6 lg:p-7 shadow-sm transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
        {/* Left: Fluid Score & Core Diagnostic */}
        <div className="flex items-center gap-5 sm:gap-6 min-w-0">
          {/* Minimalist Gauge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="7"
              />
              <circle
                ref={circleRef}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={assessment.stroke}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span
                ref={numberRef}
                className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight"
              >
                0
              </span>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                Score
              </span>
            </div>
          </div>

          {/* Diagnostic Context */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              {stats.security_score >= 75 ? (
                <TbShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <TbShieldExclamation className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className={`text-sm sm:text-base font-semibold ${assessment.color}`}>
                {assessment.grade} — {assessment.title}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {assessment.diagnostic}
            </p>

            <div className="flex items-center gap-3 pt-0.5 text-[11px] font-mono text-slate-400">
              <span>CIS Benchmark v1.6</span>
              <span>•</span>
              <Link
                to="/findings"
                className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>Inspect All Findings</span>
                <FiArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Borderless Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-white/[0.06] border-t sm:border-t-0 border-white/[0.06] pt-4 sm:pt-0 shrink-0">
          {/* 1. Containers */}
          <Link
            to="/containers"
            className="sm:px-5 first:pl-0 space-y-1 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <SiDocker className="w-3.5 h-3.5 text-emerald-400" />
              <span>Containers</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                ref={cRef}
                className="text-xl sm:text-2xl font-bold font-mono text-white group-hover:text-emerald-300 transition-colors"
              >
                0
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                / {stats.containers_total}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">active workloads</p>
          </Link>

          {/* 2. Specs Audited */}
          <div className="sm:px-5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <FiFileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Resources</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                ref={rRef}
                className="text-xl sm:text-2xl font-bold font-mono text-white"
              >
                0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">Docker & Compose</p>
          </div>

          {/* 3. Total Misconfigurations */}
          <Link
            to="/findings"
            className="sm:px-5 space-y-1 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <TbShieldExclamation className="w-3.5 h-3.5 text-amber-400" />
              <span>Findings</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                ref={fRef}
                className="text-xl sm:text-2xl font-bold font-mono text-white group-hover:text-amber-300 transition-colors"
              >
                0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">hardening issues</p>
          </Link>

          {/* 4. Critical & High */}
          <Link
            to="/findings?severity=CRITICAL"
            className="sm:px-5 last:pr-0 space-y-1 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <FiAlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Critical Alerts</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                ref={aRef}
                className="text-xl sm:text-2xl font-bold font-mono text-red-400 group-hover:text-red-300 transition-colors"
              >
                0
              </span>
            </div>
            <p className="text-[10px] text-red-400/80 truncate font-medium">immediate action</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostureHorizon;
