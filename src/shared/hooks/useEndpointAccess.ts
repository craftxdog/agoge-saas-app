import type {
  EndpointMethod,
  EndpointPermissionRule,
} from "@/modules/rbac/schemas/rbac.schema";
import { useRbacEndpointRules } from "@/modules/rbac/hooks/useRbac";
import { hasAnyPermission, type PermissionChecker } from "@/shared/auth/permission-policy";
import { useAuth } from "./useAuth";

export type EndpointAccessAction = {
  method: EndpointMethod;
  path: string;
  fallbackPermissions?: readonly string[];
};

const API_PREFIX_PATTERN = /^\/api\/v\d+/i;

const normalizeEndpointPath = (path: string) => {
  const [withoutQuery] = path.trim().split("?");
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const withoutPrefix = withSlash.replace(API_PREFIX_PATTERN, "");
  const withoutTrailingSlash =
    withoutPrefix.length > 1 ? withoutPrefix.replace(/\/+$/, "") : withoutPrefix;

  return withoutTrailingSlash || "/";
};

const splitPath = (path: string) =>
  normalizeEndpointPath(path).split("/").filter(Boolean);

export const endpointRuleMatches = (
  rule: EndpointPermissionRule,
  action: Pick<EndpointAccessAction, "method" | "path">,
) => {
  if (!rule.isActive || rule.method !== action.method) return false;

  const ruleSegments = splitPath(rule.pathPattern);
  const actionSegments = splitPath(action.path);
  if (ruleSegments.length !== actionSegments.length) return false;

  return ruleSegments.every((segment, index) => {
    if (segment.startsWith(":") || (segment.startsWith("{") && segment.endsWith("}"))) {
      return actionSegments[index]?.length > 0;
    }

    return segment === actionSegments[index];
  });
};

export const canAccessEndpoint = ({
  action,
  endpointRules,
  hasPermission,
}: {
  action: EndpointAccessAction;
  endpointRules: EndpointPermissionRule[];
  hasPermission: PermissionChecker;
}) => {
  const matches = endpointRules.filter((rule) => endpointRuleMatches(rule, action));

  if (matches.length > 0) {
    return matches.some((rule) => hasPermission(rule.permissionKey));
  }

  return hasAnyPermission(hasPermission, action.fallbackPermissions ?? []);
};

export const useEndpointAccess = () => {
  const { activeMembership, hasPermission, isAuthenticated } = useAuth();
  const endpointRules = useRbacEndpointRules({
    enabled: Boolean(isAuthenticated && activeMembership),
  });

  const rules = endpointRules.data ?? [];

  const can = (action: EndpointAccessAction) =>
    canAccessEndpoint({
      action,
      endpointRules: rules,
      hasPermission,
    });

  return {
    endpointRules: rules,
    isLoading: endpointRules.isLoading,
    can,
    canAny: (actions: EndpointAccessAction[]) => actions.some(can),
  };
};
