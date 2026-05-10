import {
  IconBell,
  IconCalendar,
  IconChartBar,
  IconCreditCard,
  IconDashboard,
  IconFileAnalytics,
  IconSettings,
  IconShieldCheck,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import { useNavigationContext } from "@/shared/providers/navigation-provider";

export const useSidebarRoutes = () => {
  const { modules } = useNavigationContext();

  const groupedModuleConfig = {
    analytics: {
      primaryPath: "/analytics/dashboard",
      secondaryPaths: ["/analytics/me/dashboard"],
      title: "Analytics",
    },
    billing: {
      primaryPath: "/billing/payments",
      secondaryPaths: ["/billing/me/payments"],
      title: "Billing",
    },
    notifications: {
      primaryPath: "/notifications",
      secondaryPaths: ["/activity"],
      title: "Notifications",
    },
    schedules: {
      primaryPath: "/schedules/business-hours",
      secondaryPaths: ["/schedules/me/availability"],
      title: "Schedules",
    },
    settings: {
      primaryPath: "/settings/general",
      secondaryPaths: ["/settings/roles"],
      title: "Settings",
    },
  } as const;

  const moduleIconMap = {
    analytics: IconChartBar,
    audit: IconShieldLock,
    billing: IconCreditCard,
    notifications: IconBell,
    schedules: IconCalendar,
    settings: IconSettings,
    users: IconUsers,
  } as const;

  const screenIconMap: Record<string, typeof IconDashboard> = {
    "/activity": IconBell,
    "/analytics/dashboard": IconChartBar,
    "/analytics/me/dashboard": IconFileAnalytics,
    "/audit/activity": IconShieldLock,
    "/billing/me/payments": IconCreditCard,
    "/billing/payments": IconCreditCard,
    "/billing/settings": IconSettings,
    "/schedules/business-hours": IconCalendar,
    "/schedules/me/availability": IconCalendar,
    "/settings/general": IconSettings,
    "/settings/modules": IconSettings,
    "/settings/roles": IconShieldCheck,
    "/users/members": IconUsers,
  };

  const mapScreen = (
    screen: (typeof modules)[number]["screens"][number],
    module: (typeof modules)[number],
  ) => ({
    title: screen.title,
    url: `/app${screen.path}`,
    icon:
      screenIconMap[screen.path] ??
      moduleIconMap[module.key as keyof typeof moduleIconMap] ??
      IconDashboard,
    items: undefined,
  });

  const mapModule = (module: (typeof modules)[number]) => {
    const screens = module.screens.filter((screen) => Boolean(screen.path));

    if (!screens.length) {
      return null;
    }

    const groupedConfig =
      groupedModuleConfig[module.key as keyof typeof groupedModuleConfig];

    if (groupedConfig) {
      const primaryScreen =
        screens.find((screen) => screen.path === groupedConfig.primaryPath) ??
        screens[0];
      const preferredSecondaryScreens = groupedConfig.secondaryPaths
        .map((path) => screens.find((screen) => screen.path === path))
        .filter((screen): screen is (typeof modules)[number]["screens"][number] =>
          Boolean(screen && screen.path !== primaryScreen.path),
        );
      const remainingScreens = screens.filter(
        (screen) =>
          screen.path !== primaryScreen.path &&
          !preferredSecondaryScreens.some((item) => item.path === screen.path),
      );
      const secondaryScreens = [
        ...preferredSecondaryScreens,
        ...remainingScreens,
      ];

      return {
        title: groupedConfig.title,
        url: `/app${primaryScreen.path}`,
        icon:
          screenIconMap[primaryScreen.path] ??
          moduleIconMap[module.key as keyof typeof moduleIconMap] ??
          IconDashboard,
        items: secondaryScreens.length
          ? secondaryScreens.map((screen) => mapScreen(screen, module))
          : undefined,
      };
    }

    const primaryScreen = screens[0];
    const children = screens.length > 1 ? screens.map((screen) => mapScreen(screen, module)) : undefined;

    return {
      title:
        module.key === "audit"
          ? module.name
          : screens.length === 1
            ? primaryScreen.title
            : module.name,
      url: `/app${primaryScreen.path}`,
      icon:
        screenIconMap[primaryScreen.path] ??
        moduleIconMap[module.key as keyof typeof moduleIconMap] ??
        IconDashboard,
      items: children,
    };
  };

  return modules
    .map((module) => mapModule(module))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};
