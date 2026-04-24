import type { AuthMembership } from "@/modules/auth/schemas/auth.schema";
import type { AppRoute } from "@/shared/types/AppRoute.type";

const CUSTOMER_PORTAL_MODULES = new Set(["billing", "schedules"]);
const CUSTOMER_PORTAL_PATHS = new Set(["", "profile", "billing", "schedules"]);
const CUSTOMER_BREAKOUT_PERMISSIONS = new Set([
  "users.read",
  "users.write",
  "billing.write",
  "schedules.write",
  "settings.read",
  "settings.write",
  "modules.manage",
  "roles.manage",
  "audit.read",
  "analytics.read",
]);

type AccessContextInput = {
  activeMembership?: AuthMembership | null;
  enabledModules?: string[];
  permissions?: string[];
};

export const isCustomerMembership = (
  membership?: AuthMembership | null,
) => membership?.roles.includes("customer") ?? false;

export const isCustomerPortalRoute = (route: Pick<AppRoute, "path">) =>
  CUSTOMER_PORTAL_PATHS.has(route.path);

export const isCustomerPortalModule = (moduleKey?: string) =>
  !moduleKey || CUSTOMER_PORTAL_MODULES.has(moduleKey);

export const createAccessContext = ({
  activeMembership,
  enabledModules = [],
  permissions = [],
}: AccessContextInput) => {
  const isCustomerPortal =
    isCustomerMembership(activeMembership) &&
    !permissions.some((permission) => CUSTOMER_BREAKOUT_PERMISSIONS.has(permission));
  const visibleModules = isCustomerPortal
    ? enabledModules.filter((moduleKey) => CUSTOMER_PORTAL_MODULES.has(moduleKey))
    : enabledModules;

  return {
    organizationId: activeMembership?.organization.id ?? null,
    memberId: activeMembership?.id ?? null,
    isCustomerPortal,
    visibleModules,
    permissions,
    canAccessModule: (moduleKey: string) => visibleModules.includes(moduleKey),
    canAccessRoute: (route: Pick<AppRoute, "path" | "module" | "allowCustomerPortal">) => {
      if (!isCustomerPortal) return true;
      if (route.allowCustomerPortal === false) return false;
      return (
        isCustomerPortalRoute(route) &&
        isCustomerPortalModule(route.module)
      );
    },
  };
};
