/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useRbacNavigation } from "@/modules/rbac/hooks/useRbac";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  createNavigationRuntime,
  normalizeAppPath,
  type AuthorizedModule,
  type AuthorizedScreen,
} from "@/shared/navigation/navigation-utils";

type NavigationContextValue = {
  modules: AuthorizedModule[];
  screens: AuthorizedScreen[];
  isLoading: boolean;
  isReady: boolean;
  hasTenantAccess: boolean;
  hasSelfAccess: boolean;
  defaultPath: string;
  findScreen: (path: string) => AuthorizedScreen | null;
  getModule: (moduleKey: string) => AuthorizedModule | null;
  getModulePrimaryPath: (moduleKey: string) => string | null;
  hasAuthorizedPath: (path: string) => boolean;
  refetchNavigation: () => Promise<unknown>;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, activeMembership } = useAuth();
  const organizationId = activeMembership?.organization.id;
  const memberId = activeMembership?.id;
  const enabled = Boolean(isAuthenticated && organizationId);
  const navigationQuery = useRbacNavigation({
    enabled,
    organizationId,
    memberId,
  });

  const runtime = useMemo(
    () => createNavigationRuntime(navigationQuery.data?.modules),
    [navigationQuery.data?.modules],
  );

  const value = useMemo<NavigationContextValue>(
    () => ({
      modules: runtime.modules,
      screens: runtime.screens,
      isLoading: enabled && navigationQuery.isLoading,
      isReady: !enabled || navigationQuery.isSuccess,
      hasTenantAccess: runtime.hasTenantAccess,
      hasSelfAccess: runtime.hasSelfAccess,
      defaultPath: runtime.defaultPath,
      findScreen: (path: string) =>
        runtime.screenMap.get(normalizeAppPath(path)) ?? null,
      getModule: (moduleKey: string) => runtime.moduleMap.get(moduleKey) ?? null,
      getModulePrimaryPath: (moduleKey: string) =>
        runtime.moduleMap.get(moduleKey)?.primaryPath ?? null,
      hasAuthorizedPath: (path: string) =>
        runtime.screenMap.has(normalizeAppPath(path)),
      refetchNavigation: async () => navigationQuery.refetch(),
    }),
    [enabled, navigationQuery, runtime],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider",
    );
  }

  return context;
};
