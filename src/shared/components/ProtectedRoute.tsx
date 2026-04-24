import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import type { AuthUser } from "@/modules/auth/schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";

type Props = PropsWithChildren<{
  allowedPlatformRoles?: AuthUser["platformRole"][];
  requiredModules?: string[];
  requiredPermissions?: string[];
  requireTenant?: boolean;
}>;

export const ProtectedRoute = ({
  children,
  allowedPlatformRoles,
  requiredModules,
  requiredPermissions,
  requireTenant = false,
}: Props) => {
  const {
    isAuthenticated,
    user,
    activeMembership,
    enabledModules,
    permissions,
    isHydrated,
  } = useAuth();

  if (!isHydrated) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (
    allowedPlatformRoles &&
    user &&
    !allowedPlatformRoles.includes(user.platformRole)
  ) {
    return <Navigate to="/app" replace />;
  }

  if (requireTenant && !activeMembership) {
    return <Navigate to="/app" replace />;
  }

  if (
    requiredModules?.some((moduleKey) => !enabledModules.includes(moduleKey))
  ) {
    return <Navigate to="/app" replace />;
  }

  if (
    requiredPermissions?.some((permission) => !permissions.includes(permission))
  ) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
