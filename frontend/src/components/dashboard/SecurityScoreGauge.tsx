import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { TbShieldCheck, TbShieldExclamation } from "react-icons/tb";

interface SecurityScoreGaugeProps {
  score: number; // 0 - 100
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({ score }) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (numberRef.current) {
      const obj = { val: 0 };
      animate(obj, {
        val: score,
        ease: "outExpo",
        duration: 1200,
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerHTML = String(Math.round(obj.val));
          }
        },
      });
    }

    if (circleRef.current) {
      animate(circleRef.current, {
        strokeDashoffset: [circumference, strokeDashoffset],
        ease: "outCubic",
        duration: 1200,
      });
    }
  }, [score, circumference, strokeDashoffset]);

  const getGrade = (s: number) => {
    if (s >= 90) return { label: "Grade A", desc: "Hardened Posture", color: "text-emerald-400" };
    if (s >= 75) return { label: "Grade B", desc: "Good Isolation", color: "text-emerald-300" };
    if (s >= 60) return { label: "Grade C", desc: "Action Required", color: "text-amber-400" };
    return { label: "Grade F", desc: "Severe Exposure", color: "text-red-400" };
  };

  const grade = getGrade(score);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-sm">
      {/* Circular Gauge */}
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="9"
          />
          <circle
            ref={circleRef}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={score > 70 ? "#10B981" : score > 50 ? "#F59E0B" : "#EF4444"}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            ref={numberRef}
            className="text-2xl font-bold font-mono text-slate-100 tracking-tight"
          >
            {score}
          </span>
          <span className="text-[10px] uppercase font-mono text-slate-400">
            / 100 Score
          </span>
        </div>
      </div>

      {/* Evaluation Context */}
      <div className="flex-1 text-center sm:text-left space-y-1.5">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {score >= 70 ? (
            <TbShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <TbShieldExclamation className="w-5 h-5 text-amber-400" />
          )}
          <span className={`text-base font-bold font-mono ${grade.color}`}>
            {grade.label} — {grade.desc}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Aggregated hardening metric across all static Dockerfiles, Compose configurations, and live container socket parameters against CIS Docker Benchmark rules.
        </p>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs font-mono text-slate-400">
          <span>● Baseline: CIS v1.6</span>
          <span>● 8 Active Rules</span>
          <span className="text-emerald-400">● 100% Policy Target</span>
        </div>
      </div>
    </div>
  );
};
