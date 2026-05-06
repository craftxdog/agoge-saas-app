import { useLocation } from "react-router-dom";
import { useSidebarRoutes } from "./useSidebarRoutes";
import type { SidebarNavItem } from "@/shared/types/SidebarNavItem";

type SidebarRoute = ReturnType<typeof useSidebarRoutes>[number];

export const useSidebarNav = () => {
  const routes = useSidebarRoutes();
  const location = useLocation();

  const isRouteActive = (fullPath: string) => {
    const normalizedPath = fullPath.replace(/\/+$/, "") || "/";
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";

    if (normalizedPath === "/app") {
      return currentPath === "/app";
    }

    return (
      currentPath === normalizedPath ||
      currentPath.startsWith(`${normalizedPath}/`)
    );
  };

  const mapRoutes = (routes: SidebarRoute[]): SidebarNavItem[] => {
    return routes.map((route) => {
      const fullPath = route.url;

      return {
        title: route.title,
        url: fullPath,
        icon: route.icon,
        isActive: isRouteActive(fullPath),
        items:
          route.items && route.items.length > 0
            ? mapRoutes(route.items)
            : undefined,
      };
    });
  };

  return mapRoutes(routes);
};
