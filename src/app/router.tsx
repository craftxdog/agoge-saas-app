import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./Layout/AppLayout";
import {
  AuthorizedScreenRoute,
  ModuleLandingRoute,
  ProtectedRoute,
} from "../shared/components/ProtectedRoute";

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
import RestrictedPage from "@/shared/pages/restricted";

const withAuthorizedScreen = (path: string, element: ReactNode) => ({
  path: path.replace(/^\/app\//, ""),
  element: <AuthorizedScreenRoute path={path}>{element}</AuthorizedScreenRoute>,
});

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
        path: "restricted",
        element: <RestrictedPage />,
      },
      {
        path: "users",
        element: <ModuleLandingRoute moduleKey="users" />,
      },
      withAuthorizedScreen("/app/users/members", <MembersPage />),
      {
        path: "billing",
        element: <ModuleLandingRoute moduleKey="billing" />,
      },
      withAuthorizedScreen(
        "/app/billing/payments",
        <BillingPage initialTab="payments" />,
      ),
      withAuthorizedScreen(
        "/app/billing/settings",
        <BillingPage initialTab="methods" surface="settings" />,
      ),
      withAuthorizedScreen(
        "/app/billing/me/payments",
        <BillingPage initialTab="payments" />,
      ),
      {
        path: "analytics",
        element: <ModuleLandingRoute moduleKey="analytics" />,
      },
      withAuthorizedScreen(
        "/app/analytics/dashboard",
        <AnalyticsDashboard />,
      ),
      withAuthorizedScreen(
        "/app/analytics/me/dashboard",
        <AnalyticsDashboard />,
      ),
      {
        path: "schedules",
        element: <ModuleLandingRoute moduleKey="schedules" />,
      },
      withAuthorizedScreen(
        "/app/schedules/business-hours",
        <SchedulesPage />,
      ),
      withAuthorizedScreen(
        "/app/schedules/me/availability",
        <SchedulesPage />,
      ),
      withAuthorizedScreen("/app/notifications", <NotificationsPage />),
      withAuthorizedScreen("/app/activity", <ActivityPage />),
      {
        path: "rbac",
        element: <Navigate to="/app/settings/roles" replace />,
      },
      withAuthorizedScreen("/app/settings/roles", <RbacPage />),
      {
        path: "audit",
        element: <ModuleLandingRoute moduleKey="audit" />,
      },
      withAuthorizedScreen("/app/audit/activity", <AuditPage />),
      {
        path: "settings",
        element: <ModuleLandingRoute moduleKey="settings" />,
      },
      withAuthorizedScreen(
        "/app/settings/general",
        <CompanySettingsPage initialTab="company" />,
      ),
      withAuthorizedScreen(
        "/app/settings/modules",
        <CompanySettingsPage initialTab="modules" />,
      ),
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
