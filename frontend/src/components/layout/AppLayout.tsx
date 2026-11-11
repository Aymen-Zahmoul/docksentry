import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { NewScanModal } from "../scans/NewScanModal";
import { CloudBackground } from "../ui/CloudBackground";
import { FloatingDock } from "../ui/floating-dock";
import { ScanType } from "../../types/scan";
import {
  IconHome,
  IconShieldExclamation,
  IconBrandDocker,
  IconActivity,
  IconAdjustments,
  IconReport,
  IconSettings,
  IconBrandGithub,
} from "@tabler/icons-react";

interface AppLayoutProps {
  onScanCompleted?: (scanType: ScanType, target: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onScanCompleted }) => {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("docker-compose.yml");

  const handleScanDone = (type: ScanType, target: string) => {
    setSelectedTarget(target);
    if (onScanCompleted) {
      onScanCompleted(type, target);
    }
  };

  const navDockItems = [
    {
      title: "Overview",
      icon: <IconHome className="h-full w-full text-emerald-400" />,
      href: "/",
    },
    {
      title: "Findings",
      icon: <IconShieldExclamation className="h-full w-full text-red-400" />,
      href: "/findings",
    },
    {
      title: "Containers",
      icon: <IconBrandDocker className="h-full w-full text-blue-400" />,
      href: "/containers",
    },
    {
      title: "Scans",
      icon: <IconActivity className="h-full w-full text-emerald-300" />,
      href: "/scans",
    },
    {
      title: "Rules Catalog",
      icon: <IconAdjustments className="h-full w-full text-amber-400" />,
      href: "/rules",
    },
    {
      title: "Reports",
      icon: <IconReport className="h-full w-full text-cyan-400" />,
      href: "/reports",
    },
    {
      title: "Settings",
      icon: <IconSettings className="h-full w-full text-slate-300" />,
      href: "/settings",
    },
    {
      title: "GitHub",
      icon: <IconBrandGithub className="h-full w-full text-slate-400 hover:text-white" />,
      href: "https://github.com/Aymen-Zahmoul/docksentry",
    },
  ];

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-sentry-bg text-sentry-text">
      {/* WebGL Cloud Shader Background across all pages */}
      <CloudBackground />

      {/* Clean Top Header (Slop-free) */}
      <Header
        selectedTarget={selectedTarget}
        onSelectTarget={setSelectedTarget}
        onOpenNewScan={() => setIsScanModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="relative flex-1 overflow-y-auto px-6 py-6 lg:px-12 pb-28 z-10">
        <Outlet />
      </main>

      {/* Floating Navigation Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <FloatingDock items={navDockItems} />
      </div>

      {/* New Scan Runner Modal */}
      <NewScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanCompleted={handleScanDone}
      />
    </div>
  );
};
