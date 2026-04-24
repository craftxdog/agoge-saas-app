import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      activeMembership: s.activeMembership,
      memberships: s.memberships,
      permissions: s.permissions,
      enabledModules: s.enabledModules,
      isAuthenticated: s.isAuthenticated,
      isHydrated: s.isHydrated,
      login: s.login,
      setSession: s.setSession,
      logout: s.logout,
      hasPermission: s.hasPermission,
      hasModule: s.hasModule,
    })),
  );
};
