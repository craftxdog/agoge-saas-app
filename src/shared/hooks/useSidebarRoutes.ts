import { appRoutes } from "../../app/constant/routes";
import { useAuthStore } from "../store/auth.store";

export const useSidebarRoutes = () => {
  const { user, enabledModules, permissions } = useAuthStore();

  if (!user) return [];

  const filterRoutes = (routes: typeof appRoutes): typeof appRoutes => {
    return routes
      .filter((route) => {
        if (route.showInSidebar === false) return false;

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
          children: children?.length ? children : undefined,
        };
      });
  };

  return filterRoutes(appRoutes);
};
