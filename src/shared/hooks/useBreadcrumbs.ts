import { useLocation } from "react-router-dom";
import { useSidebarNav } from "./useSidebarNav";
import type { SidebarNavItem } from "@/shared/types/SidebarNavItem";

export const useBreadcrumbs = () => {
  const nav = useSidebarNav();
  const location = useLocation();

  const findPath = (
    items: SidebarNavItem[],
    path: string,
    parents: SidebarNavItem[] = []
  ): SidebarNavItem[] => {
    for (const item of items) {
      if (item.url === path) return [...parents, item];

      if (item.items) {
        const found = findPath(item.items, path, [...parents, item]);
        if (found.length) return found;
      }
    }
    return [];
  };

  return findPath(nav, location.pathname);
};
