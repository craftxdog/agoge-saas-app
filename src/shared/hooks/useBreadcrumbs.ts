import { useLocation } from "react-router-dom";
import { useNavigationContext } from "@/shared/providers/navigation-provider";

const internalCrumbs: Record<string, Array<{ title: string; url: string }>> = {
  "/app": [{ title: "Dashboard", url: "/app" }],
  "/app/profile": [
    { title: "Dashboard", url: "/app" },
    { title: "Perfil", url: "/app/profile" },
  ],
  "/app/restricted": [
    { title: "Dashboard", url: "/app" },
    { title: "Acceso restringido", url: "/app/restricted" },
  ],
};

export const useBreadcrumbs = () => {
  const location = useLocation();
  const { findScreen, getModule } = useNavigationContext();
  const screen = findScreen(location.pathname);

  if (!screen) {
    return internalCrumbs[location.pathname] ?? [];
  }

  const module = getModule(screen.moduleKey);

  if (!module || module.screens.length <= 1 || module.primaryPath === screen.fullPath) {
    return [{ title: screen.title, url: screen.fullPath }];
  }

  return [
    {
      title: module.name,
      url: module.primaryPath ?? screen.fullPath,
    },
    {
      title: screen.title,
      url: screen.fullPath,
    },
  ];
};
