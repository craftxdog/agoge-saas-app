import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { createAccessContext } from "@/shared/auth/access";

export const useAccessContext = () => {
  const { activeMembership, enabledModules, permissions } = useAuth();

  return useMemo(
    () =>
      createAccessContext({
        activeMembership,
        enabledModules,
        permissions,
      }),
    [activeMembership, enabledModules, permissions],
  );
};

