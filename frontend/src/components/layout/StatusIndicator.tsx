import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

interface StatusIndicatorProps {
  connected: boolean;
  version?: string;
  endpoint?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  connected,
  version = "27.3.1",
  endpoint = "unix:///var/run/docker.sock",
}) => {
  const pulseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (connected && pulseRef.current) {
      animate(pulseRef.current, {
        scale: [1, 2.2],
        opacity: [0.8, 0],
        ease: "outQuad",
        duration: 1800,
        loop: true,
      });
    }
  }, [connected]);

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-sentry-surface border border-sentry-border/70 text-xs">
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        {connected ? (
          <>
            <span
              ref={pulseRef}
              className="absolute inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400"
            />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
          </>
        ) : (
          <span className="relative inline-flex w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_#EF4444]" />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sentry-text">
          {connected ? "Docker Connected" : "Docker Offline"}
        </span>
        {connected && (
          <span className="text-[10px] text-sentry-muted font-mono hidden sm:inline">
            v{version}
          </span>
        )}
      </div>

      <div className="text-[10px] text-sentry-text-dim/60 font-mono hidden md:inline border-l border-sentry-border pl-2 truncate max-w-[150px]">
        {endpoint}
      </div>
    </div>
  );
};
