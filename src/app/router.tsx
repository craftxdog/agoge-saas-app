import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./Layout/AppLayout";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";

import Dashboard from "@/modules/dashboard/Dashboard";
import LoginPage from "@/modules/auth/pages/login-page";
import RegisterPage from "@/modules/auth/pages/register-page";
import AcceptInvitationPage from "@/modules/auth/pages/accept-invitation-page";
import WelcomePage from "@/modules/marketing/pages/welcome-page";
import { AnalyticsDashboard } from "@/modules/analytics/page/AnalyticsDashboard";
import ProfilePage from "@/modules/profile/pages/ProfilePage";
import CompanySettingsPage from "@/modules/settings/pages/CompanySettingsPage";
import MembersPage from "@/modules/users/pages/MembersPage";
import RbacPage from "@/modules/rbac/pages/RbacPage";
import SchedulesPage from "@/modules/schedules/pages/SchedulesPage";
import BillingPage from "@/modules/billing/pages/BillingPage";
import AuditPage from "@/modules/audit/pages/AuditPage";
import ErrorPage from "@/shared/pages/error-page";
import NotFoundPage from "@/shared/pages/not-found";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/accept-invitation",
    element: <AcceptInvitationPage />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "users",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["users"]}
            requiredPermissions={["users.read"]}
          >
            <MembersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["billing"]}
            requiredPermissions={["billing.read"]}
          >
            <BillingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["analytics"]}
            requiredPermissions={["analytics.read"]}
          >
            <AnalyticsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedules",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["schedules"]}
            requiredPermissions={["schedules.read"]}
          >
            <SchedulesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "rbac",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["settings"]}
            requiredPermissions={["roles.manage"]}
          >
            <RbacPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["audit"]}
            requiredPermissions={["audit.read"]}
          >
            <AuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["settings"]}
            requiredPermissions={["settings.read"]}
          >
            <CompanySettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
