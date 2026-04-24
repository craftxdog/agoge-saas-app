export const realtimeEvents = [
  "notifications:new",
  "audit:new",
  "billing:updated",
  "members:updated",
  "schedules:updated",
  "settings:updated",
  "analytics:updated",
] as const;

export type RealtimeEventName = (typeof realtimeEvents)[number];
export type RealtimeQueryKeyRoot =
  | "analytics"
  | "audit"
  | "billing"
  | "schedules"
  | "settings"
  | "users";

export type RealtimeEventPayload = {
  eventId?: string;
  organizationId?: string;
  memberId?: string;
  action?: string;
  queryKeys?: RealtimeQueryKeyRoot[];
  timestamp?: string;
  data?: unknown;
};

export type ServerToClientEvents = {
  [K in RealtimeEventName]: (payload: RealtimeEventPayload) => void;
};

export type ClientToServerEvents = {
  "tenant:join": (payload: { organizationId: string }) => void;
  "tenant:leave": (payload: { organizationId: string }) => void;
  ping: () => void;
};

const defaultRealtimeQueryMap: Record<
  RealtimeEventName,
  RealtimeQueryKeyRoot[]
> = {
  "notifications:new": ["analytics"],
  "audit:new": ["audit", "analytics"],
  "billing:updated": ["billing", "analytics"],
  "members:updated": ["users", "analytics", "schedules"],
  "schedules:updated": ["schedules", "analytics"],
  "settings:updated": ["settings"],
  "analytics:updated": ["analytics"],
};

export const resolveRealtimeQueryKeys = (
  event: RealtimeEventName,
  payload?: RealtimeEventPayload,
) => payload?.queryKeys?.length ? payload.queryKeys : defaultRealtimeQueryMap[event];

