import { useLocation } from "react-router-dom";
import { useSidebarRoutes } from "./useSidebarRoutes";
import type { SidebarNavItem } from "@/shared/types/SidebarNavItem";
import type { AppRoute } from "@/shared/types/AppRoute.type";

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

  const mapRoutes = (routes: AppRoute[], parentPath = "/app"): SidebarNavItem[] => {
    return routes.map((route) => {
      const fullPath = route.path
        ? `${parentPath}/${route.path}`.replace(/\/+/g, "/")
        : parentPath;

      return {
        title: route.label,
        url: fullPath,
        icon: route.icon,
        isActive: isRouteActive(fullPath),
        items:
          route.children && route.children.length > 0
            ? mapRoutes(route.children, fullPath)
            : undefined,
      };
    });
  };

  return mapRoutes(routes);
};
