import type { AuthMembership } from "@/modules/auth/schemas/auth.schema";

type AccessContextInput = {
  activeMembership?: AuthMembership | null;
  enabledModules?: string[];
  permissions?: string[];
};

export const isCustomerMembership = (
  membership?: AuthMembership | null,
) => membership?.roles.includes("customer") ?? false;

const isSelfScopedPermission = (permission: string) =>
  permission.includes(".self.");

const isTenantScopedPermission = (permission: string) =>
  permission.includes(".") && !permission.includes(".self.");

export const createAccessContext = ({
  activeMembership,
  enabledModules = [],
  permissions = [],
}: AccessContextInput) => {
  const hasSelfScope = permissions.some(isSelfScopedPermission);
  const hasTenantScope = permissions.some(isTenantScopedPermission);
  const isCustomerPortal = hasSelfScope && !hasTenantScope;
  const visibleModules = enabledModules;

  return {
    organizationId: activeMembership?.organization.id ?? null,
    memberId: activeMembership?.id ?? null,
    isCustomerPortal,
    visibleModules,
    permissions,
    canAccessModule: (moduleKey: string) => visibleModules.includes(moduleKey),
    canAccessRoute: () => true,
  };
};
