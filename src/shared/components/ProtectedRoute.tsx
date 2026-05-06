import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import type { AuthUser } from "@/modules/auth/schemas/auth.schema";
import { createAccessContext } from "@/shared/auth/access";
import { useAuth } from "../hooks/useAuth";

type Props = PropsWithChildren<{
  allowedPlatformRoles?: AuthUser["platformRole"][];
  requiredModules?: string[];
  requiredPermissions?: string[];
  requiredPermissionsAny?: string[];
  requireTenant?: boolean;
  allowCustomerPortal?: boolean;
}>;

export const ProtectedRoute = ({
  children,
  allowedPlatformRoles,
  requiredModules,
  requiredPermissions,
  requiredPermissionsAny,
  requireTenant = false,
  allowCustomerPortal = true,
}: Props) => {
  const {
    isAuthenticated,
    user,
    activeMembership,
    enabledModules,
    permissions,
    isHydrated,
  } = useAuth();
  const { isCustomerPortal } = createAccessContext({
    activeMembership,
    enabledModules,
    permissions,
  });

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

  if (!allowCustomerPortal && isCustomerPortal) {
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

  if (
    requiredPermissionsAny?.length &&
    !requiredPermissionsAny.some((permission) => permissions.includes(permission))
  ) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
