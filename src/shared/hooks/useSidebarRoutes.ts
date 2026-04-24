import { appRoutes } from "../../app/constant/routes";
import { createAccessContext } from "@/shared/auth/access";
import { useAuthStore } from "../store/auth.store";

export const useSidebarRoutes = () => {
  const { user, activeMembership, enabledModules, permissions } = useAuthStore();

  if (!user) return [];

  const access = createAccessContext({
    activeMembership,
    enabledModules,
    permissions,
  });

  const filterRoutes = (routes: typeof appRoutes): typeof appRoutes => {
    return routes
      .filter((route) => {
        if (route.showInSidebar === false) return false;
        if (!access.canAccessRoute(route)) return false;

        if (
          route.platformRoles &&
          !route.platformRoles.includes(user.platformRole)
        ) {
          return false;
        }

        if (route.module && !enabledModules.includes(route.module)) {
          return false;
        }

        if (
          route.permissions?.some(
            (permission) => !permissions.includes(permission),
          )
        ) {
          return false;
        }

        return true;
      })
      .map((route) => {
        const children = route.children ? filterRoutes(route.children) : undefined;

        return {
          ...route,
          label:
            access.isCustomerPortal && route.customerLabel
              ? route.customerLabel
              : route.label,
          children: children?.length ? children : undefined,
        };
      });
  };

  return filterRoutes(appRoutes);
};
