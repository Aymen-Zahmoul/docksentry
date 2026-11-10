import React, { useState } from "react";
import { FiSave, FiRefreshCw, FiCheck } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { Switch } from "../components/ui/Switch";

export const SettingsPage: React.FC = () => {
  const [socketPath, setSocketPath] = useState("unix:///var/run/docker.sock");
  const [autoScanOnSave, setAutoScanOnSave] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [blockOnCritical, setBlockOnCritical] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-sentry-text">
          Console & Scanner Settings
        </h1>
        <p className="text-xs text-sentry-muted mt-1">
          Configure Docker daemon endpoints, audit policy baselines, and desktop client preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Docker Engine Socket Setting */}
        <div className="p-5 rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-sentry-text">Docker Engine Endpoint</h3>
              <p className="text-xs text-sentry-muted mt-0.5">
                Location of the Docker API socket (Unix domain socket or Windows named pipe).
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active Connection
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={socketPath}
              onChange={(e) => setSocketPath(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-sentry-darkest border border-sentry-border text-sentry-text focus:outline-none focus:border-emerald-500"
            />
            <Button variant="secondary" size="sm" icon={<FiRefreshCw className="w-3.5 h-3.5" />}>
              Test Ping
            </Button>
          </div>
          <p className="text-[11px] text-sentry-muted font-mono">
            Default Unix: <code className="text-sentry-text-dim">unix:///var/run/docker.sock</code> · Windows: <code className="text-sentry-text-dim">npipe:////./pipe/dockerDesktopLinuxEngine</code>
          </p>
        </div>

        {/* Security Policy Options */}
        <div className="p-5 rounded-xl bg-sentry-surface/90 backdrop-blur-md border border-sentry-border/80 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-sentry-text">Auditing Policies & CI/CD Gating</h3>

          <div className="space-y-3 divide-y divide-sentry-border/50 text-xs">
            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-sentry-text block">Continuous Watch Mode</span>
                <span className="text-sentry-muted block text-[11px]">
                  Automatically trigger background audit when Dockerfile or docker-compose.yml files change.
                </span>
              </div>
              <Switch checked={autoScanOnSave} onChange={setAutoScanOnSave} />
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-sentry-text block">Strict CI/CD Gating (Exit Code 1)</span>
                <span className="text-sentry-muted block text-[11px]">
                  Fail scans and return exit code 1 if any CRITICAL severity misconfigurations are found.
                </span>
              </div>
              <Switch checked={blockOnCritical} onChange={setBlockOnCritical} />
            </div>

            <div className="pt-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-sentry-text block">Critical Finding Sound Notification</span>
                <span className="text-sentry-muted block text-[11px]">
                  Play subtle audio chime when a critical vulnerability is flagged during background scan.
                </span>
              </div>
              <Switch checked={soundAlerts} onChange={setSoundAlerts} />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            icon={saved ? <FiCheck className="w-4 h-4 text-white" /> : <FiSave className="w-4 h-4" />}
          >
            {saved ? "Saved Configuration" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};
