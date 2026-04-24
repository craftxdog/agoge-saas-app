export const realtimeCoreEvents = [
  "realtime.connected",
  "realtime.context",
  "realtime.event",
  "realtime.error",
] as const;

export type RealtimeCoreEventName = (typeof realtimeCoreEvents)[number];
export type RealtimeDomainEventName = `${string}.${string}.${string}`;
export type RealtimeEventName = RealtimeCoreEventName | RealtimeDomainEventName;
export type RealtimeQueryKeyRoot =
  | "analytics"
  | "audit"
  | "billing"
  | "rbac"
  | "schedules"
  | "settings"
  | "users";

export type RealtimeConnectionSnapshot = {
  socketId: string;
  namespace: string;
  connectedAt: string;
  user: {
    id: string;
    email: string;
    username?: string | null;
    firstName?: string;
    lastName?: string;
    platformRole: string;
  };
  organization: {
    id: string;
    slug?: string;
  } | null;
  member: {
    id: string;
    roles: string[];
    permissions: string[];
    enabledModules: string[];
  } | null;
  rooms: string[];
};

export type RealtimeEventEnvelope = {
  id: string;
  name: RealtimeDomainEventName;
  domain: string;
  resource: string;
  action: string;
  entityId?: string | null;
  organizationId: string;
  occurredAt: string;
  invalidate: string[];
  data?: unknown;
};

export type RealtimeErrorPayload = {
  code: string;
  message: string;
};

export type ServerToClientEvents = {
  "realtime.connected": (payload: RealtimeConnectionSnapshot) => void;
  "realtime.context": (payload: RealtimeConnectionSnapshot) => void;
  "realtime.event": (payload: RealtimeEventEnvelope) => void;
  "realtime.error": (payload: RealtimeErrorPayload) => void;
};

export type ClientToServerEvents = {
  "realtime.sync": (payload: { accessToken?: string }) => void;
  "realtime.ping": () => void;
};

const realtimeInvalidateRootMap: Record<string, RealtimeQueryKeyRoot> = {
  "analytics.catalog": "analytics",
  "analytics.dashboard": "analytics",
  "analytics.members": "analytics",
  "analytics.operations": "analytics",
  "analytics.revenue": "analytics",
  "audit.logs": "audit",
  "billing.payment-methods": "billing",
  "billing.payment-transactions": "billing",
  "billing.payment-types": "billing",
  "billing.payments": "billing",
  "rbac.access-matrix": "rbac",
  "rbac.member-roles": "rbac",
  "rbac.roles": "rbac",
  "schedules.business-hours": "schedules",
  "schedules.day": "schedules",
  "schedules.exceptions": "schedules",
  "schedules.locations": "schedules",
  "schedules.member-availability": "schedules",
  "settings.modules": "settings",
  "settings.organization": "settings",
  "settings.preferences": "settings",
  "settings.screens": "settings",
  "users.invitations": "users",
  "users.members": "users",
};

export const resolveRealtimeQueryRoots = (
  payload: RealtimeEventEnvelope,
): RealtimeQueryKeyRoot[] => {
  const roots = payload.invalidate
    .map(
      (key) =>
        realtimeInvalidateRootMap[key] ??
        (key.split(".")[0] as RealtimeQueryKeyRoot),
    )
    .filter(Boolean);

  if (roots.length) {
    return [...new Set(roots)];
  }

  const fallbackRoot = payload.domain as RealtimeQueryKeyRoot;
  return fallbackRoot ? [fallbackRoot] : [];
};
