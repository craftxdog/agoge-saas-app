import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { AppLayout } from "./Layout/AppLayout";

import Dashboard from "@/modules/dashboard/Dashboard";
import { LoginForm } from "@/modules/auth/pages/login-form";

export const AppRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <div>Users Page</div>,
      },
      {
        path: "payments",
        element: <div>Payments Page</div>,
      },
      {
        path: "analytics",
        element: <div>Analytics Page</div>,
      },
      {
        path: "schedules",
        element: <div>Schedules Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
]);
