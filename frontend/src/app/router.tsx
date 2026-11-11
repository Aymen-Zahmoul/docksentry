import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { FindingsPage } from "../pages/FindingsPage";
import { ContainersPage } from "../pages/ContainersPage";
import { ScansPage } from "../pages/ScansPage";
import { RulesPage } from "../pages/RulesPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "findings", element: <FindingsPage /> },
      { path: "containers", element: <ContainersPage /> },
      { path: "scans", element: <ScansPage /> },
      { path: "rules", element: <RulesPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "parameters", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
