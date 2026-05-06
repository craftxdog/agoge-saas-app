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
import { useAuthStore } from "../store/auth.store";
import {
  useRbacAccessMatrix,
  useRbacNavigation,
} from "@/modules/rbac/hooks/useRbac";
import type { AccessModule, AccessScreen } from "@/modules/rbac/schemas/rbac.schema";

export const useSidebarRoutes = () => {
  const { user, activeMembership, permissions, enabledModules } = useAuthStore();
  const navigation = useRbacNavigation({
    enabled: Boolean(user && activeMembership),
  });
  const accessMatrix = useRbacAccessMatrix({
    enabled:
      Boolean(user && activeMembership) &&
      (permissions.includes("settings.read") || permissions.includes("roles.manage")),
  });

  if (!user || !activeMembership) return [];

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
    "/schedules/business-hours": IconCalendar,
    "/schedules/me/availability": IconCalendar,
    "/settings/general": IconSettings,
    "/settings/modules": IconSettings,
    "/settings/roles": IconShieldCheck,
    "/users/members": IconUsers,
  };

  const mapScreen = (screen: AccessScreen, module: AccessModule) => ({
    title: screen.title,
    url: `/app${screen.path ?? ""}`,
    icon:
      screenIconMap[screen.path ?? ""] ??
      moduleIconMap[module.key as keyof typeof moduleIconMap] ??
      IconDashboard,
    items: undefined,
  });

  const mergeModules = (primary: AccessModule[], fallback: AccessModule[]) => {
    const modulesByKey = new Map<string, AccessModule>();

    for (const module of primary) {
      modulesByKey.set(module.key, module);
    }

    for (const module of fallback) {
      const current = modulesByKey.get(module.key);

      if (!current) {
        modulesByKey.set(module.key, module);
        continue;
      }

      const permissionKeys = new Set(current.permissions.map((permission) => permission.key));
      const screenKeys = new Set(current.screens.map((screen) => `${screen.key}:${screen.path ?? ""}`));

      modulesByKey.set(module.key, {
        ...current,
        permissions: [
          ...current.permissions,
          ...module.permissions.filter((permission) => !permissionKeys.has(permission.key)),
        ],
        screens: [
          ...current.screens,
          ...module.screens.filter(
            (screen) => !screenKeys.has(`${screen.key}:${screen.path ?? ""}`),
          ),
        ],
      });
    }

    return [
      ...primary.map((module) => modulesByKey.get(module.key) ?? module),
      ...fallback.filter((module) => !primary.some((item) => item.key === module.key)),
    ];
  };

  const permissionSet = new Set(permissions);
  const enabledModuleSet = new Set(enabledModules);
  const fallbackModules =
    accessMatrix.data?.modules
      .filter((module) => module.isEnabled && enabledModuleSet.has(module.key))
      .map((module) => ({
        ...module,
        permissions: module.permissions.filter((permission) =>
          permissionSet.has(permission.key),
        ),
        screens: module.screens.filter(
          (screen) =>
            screen.isVisible &&
            (!screen.requiredPermissionKey ||
              permissionSet.has(screen.requiredPermissionKey)),
        ),
      }))
      .filter((module) => module.screens.length > 0) ?? [];

  const effectiveModules = mergeModules(
    navigation.data?.modules ?? [],
    fallbackModules,
  );

  const mapModule = (module: AccessModule) => {
    const screens = module.screens.filter((screen) => Boolean(screen.path));

    if (!screens.length) {
      return null;
    }

    const primaryScreen = screens[0];
    const children = screens.length > 1 ? screens.map((screen) => mapScreen(screen, module)) : undefined;

    return {
      title: screens.length === 1 ? primaryScreen.title : module.name,
      url: `/app${primaryScreen.path ?? ""}`,
      icon:
        screenIconMap[primaryScreen.path ?? ""] ??
        moduleIconMap[module.key as keyof typeof moduleIconMap] ??
        IconDashboard,
      items: children,
    };
  };

  return effectiveModules
    .map((module) => mapModule(module))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};
