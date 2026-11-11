import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { FiAlertOctagon, FiRefreshCw, FiHome } from "react-icons/fi";

export const RouteErrorFallback: React.FC = () => {
  const error = useRouteError();

  let errorMessage = "An unexpected client runtime error occurred.";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data?.message || "";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl bg-slate-900/40 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <FiAlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Navigation or Render Error</h2>
            <p className="text-xs text-slate-400">DOCKSENTRY captured an unhandled exception</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-red-500/20 font-mono text-xs text-red-300 break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
          {errorMessage}
          {errorDetails && (
            <div className="mt-3 pt-3 border-t border-red-500/10 text-[11px] text-slate-500">
              {errorDetails}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-200 transition-colors shadow-sm"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Reload Page
          </button>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/[0.08] text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            <FiHome className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
