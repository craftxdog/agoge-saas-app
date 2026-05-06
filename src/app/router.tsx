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
import NotificationsPage from "@/modules/notifications/pages/NotificationsPage";
import ActivityPage from "@/modules/activity/pages/ActivityPage";
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
        element: <Navigate to="/app/users/members" replace />,
      },
      {
        path: "users/members",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["users"]}
            requiredPermissions={["users.read"]}
            allowCustomerPortal={false}
          >
            <MembersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing",
        element: <Navigate to="/app/billing/payments" replace />,
      },
      {
        path: "billing/payments",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["billing"]}
            requiredPermissionsAny={["billing.read", "billing.self.read"]}
          >
            <BillingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing/me/payments",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["billing"]}
            requiredPermissionsAny={["billing.read", "billing.self.read"]}
          >
            <BillingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: <Navigate to="/app/analytics/dashboard" replace />,
      },
      {
        path: "analytics/dashboard",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["analytics"]}
            requiredPermissionsAny={["analytics.read", "analytics.self.read"]}
          >
            <AnalyticsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics/me/dashboard",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["analytics"]}
            requiredPermissionsAny={["analytics.read", "analytics.self.read"]}
          >
            <AnalyticsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedules",
        element: <Navigate to="/app/schedules/business-hours" replace />,
      },
      {
        path: "schedules/business-hours",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["schedules"]}
            requiredPermissionsAny={["schedules.read", "schedules.self.read"]}
          >
            <SchedulesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedules/me/availability",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["schedules"]}
            requiredPermissionsAny={["schedules.read", "schedules.self.read"]}
          >
            <SchedulesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["notifications"]}
            requiredPermissions={["notifications.read"]}
            allowCustomerPortal={false}
          >
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "activity",
        element: (
          <ProtectedRoute
            requireTenant
            requiredPermissionsAny={["notifications.self.read"]}
          >
            <ActivityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "rbac",
        element: <Navigate to="/app/settings/roles" replace />,
      },
      {
        path: "settings/roles",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["settings"]}
            requiredPermissions={["roles.manage"]}
            allowCustomerPortal={false}
          >
            <RbacPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: <Navigate to="/app/audit/activity" replace />,
      },
      {
        path: "audit/activity",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["audit"]}
            requiredPermissions={["audit.read"]}
            allowCustomerPortal={false}
          >
            <AuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: <Navigate to="/app/settings/general" replace />,
      },
      {
        path: "settings/general",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["settings"]}
            requiredPermissions={["settings.read"]}
            allowCustomerPortal={false}
          >
            <CompanySettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/modules",
        element: (
          <ProtectedRoute
            requireTenant
            requiredModules={["settings"]}
            requiredPermissions={["settings.read"]}
            allowCustomerPortal={false}
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
