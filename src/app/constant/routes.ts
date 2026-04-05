import type { AppRoute } from "@/shared/types/AppRoute.type";
import {
  IconDashboard,
  IconUsers,
  IconDatabase,
  IconChartBar,
  IconSettings,
  IconCalendar,
  IconBell,
} from "@tabler/icons-react";

export const appRoutes: AppRoute[] = [
  {
    label: "Dashboard",
    path: "",
    icon: IconDashboard,
    roles: ["ADMIN", "USER"],
    showInSidebar: true,
  },
  {
    label: "Usuarios",
    path: "users",
    icon: IconUsers,
    roles: ["ADMIN"],
    showInSidebar: true,
  },
  {
    label: "Pagos",
    path: "payments",
    icon: IconDatabase,
    roles: ["ADMIN", "USER"],
    showInSidebar: true,
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: IconChartBar,
    roles: ["ADMIN"],
    showInSidebar: true,
  },
  {
    label: "Horarios",
    path: "schedules",
    icon: IconCalendar,
    roles: ["ADMIN", "USER"],
    showInSidebar: true,
  },
  {
    label: "Configuración",
    path: "settings",
    icon: IconSettings,
    roles: ["ADMIN"],
    showInSidebar: true,
  },
];
