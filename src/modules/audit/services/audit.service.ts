import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  AuditActorQuery,
  AuditCatalog,
  AuditEntityQuery,
  AuditLog,
  AuditLogQuery,
  AuditSummary,
  AuditSummaryQuery,
} from "../schemas/audit.schema";

const toSearchParams = (
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const params = toSearchParams(query);
  return params ? `${path}?${params}` : path;
};

export const auditService = {
  getSummary: (query?: AuditSummaryQuery) =>
    http.get<ApiResponse<AuditSummary>>(withQuery("/audit/summary", query)),

  getCatalog: () => http.get<ApiResponse<AuditCatalog>>("/audit/catalog"),

  listLogs: (query?: AuditLogQuery) =>
    http.get<ApiResponse<AuditLog[]>>(withQuery("/audit/logs", query)),

  getLog: (auditLogId: string) =>
    http.get<ApiResponse<AuditLog>>(`/audit/logs/${auditLogId}`),

  listEntityLogs: (
    entityType: string,
    entityId: string,
    query?: AuditEntityQuery,
  ) =>
    http.get<ApiResponse<AuditLog[]>>(
      withQuery(`/audit/entities/${entityType}/${entityId}`, query),
    ),

  listActorUserLogs: (actorUserId: string, query?: AuditActorQuery) =>
    http.get<ApiResponse<AuditLog[]>>(
      withQuery(`/audit/actors/users/${actorUserId}`, query),
    ),

  listActorMemberLogs: (actorMemberId: string, query?: AuditActorQuery) =>
    http.get<ApiResponse<AuditLog[]>>(
      withQuery(`/audit/actors/members/${actorMemberId}`, query),
    ),
};
