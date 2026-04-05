import { useAuth } from "@/shared/hooks/useAuth";
import { appRoutes } from "../../app/constant/routes";

export const useSidebarRoutes = () => {
  const { user } = useAuth();

  return appRoutes.filter(route => {
    if (!route.showInSidebar) return false;

    if (!route.roles) return true;

    return route.roles.includes(user?.role as any);
  });
};
