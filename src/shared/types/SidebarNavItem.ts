import type { Icon } from "@tabler/icons-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: Icon;
  isActive?: boolean;
  items?: SidebarNavItem[];
};
