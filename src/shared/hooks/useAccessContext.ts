import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { createAccessContext } from "@/shared/auth/access";
import { useNavigationContext } from "@/shared/providers/navigation-provider";

export const useAccessContext = () => {
  const { activeMembership, enabledModules, permissions } = useAuth();
  const { hasSelfAccess, hasTenantAccess, modules } = useNavigationContext();

  return useMemo(
    () =>
      createAccessContext({
        activeMembership,
        enabledModules:
          modules.length > 0 ? modules.map((module) => module.key) : enabledModules,
        permissions,
        hasTenantAccess,
        hasSelfAccess,
      }),
    [
      activeMembership,
      enabledModules,
      hasSelfAccess,
      hasTenantAccess,
      modules,
      permissions,
    ],
  );
};
