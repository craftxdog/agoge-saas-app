import type { Icon } from "@tabler/icons-react";

export type AppRoute = {
  label: string;
  path: string;
  icon?: Icon;

  // control SaaS
  roles?: ("ADMIN" | "USER")[];

  // navegación
  showInSidebar?: boolean;
  showInMobile?: boolean;

  // estructura
  children?: AppRoute[];

  // UX
  badge?: string | number;
};
