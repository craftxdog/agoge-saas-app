import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  auditCatalogSchema,
  auditLogSchema,
  auditSummarySchema,
  type AuditActorQuery,
  type AuditEntityQuery,
  type AuditLogQuery,
  type AuditSummaryQuery,
} from "../schemas/audit.schema";
import { auditService } from "../services/audit.service";

export const auditKeys = {
  all: ["audit"] as const,
  summary: (query?: AuditSummaryQuery) => [...auditKeys.all, "summary", query] as const,
  catalog: () => [...auditKeys.all, "catalog"] as const,
  logs: (query?: AuditLogQuery) => [...auditKeys.all, "logs", query] as const,
  log: (auditLogId?: string) => [...auditKeys.all, "log", auditLogId] as const,
  entityLogs: (entityType?: string, entityId?: string, query?: AuditEntityQuery) =>
    [...auditKeys.all, "entity", entityType, entityId, query] as const,
  actorUserLogs: (actorUserId?: string, query?: AuditActorQuery) =>
    [...auditKeys.all, "actor-user", actorUserId, query] as const,
  actorMemberLogs: (actorMemberId?: string, query?: AuditActorQuery) =>
    [...auditKeys.all, "actor-member", actorMemberId, query] as const,
};

export const useAuditSummary = (query?: AuditSummaryQuery) =>
  useQuery({
    queryKey: auditKeys.summary(query),
    queryFn: async () => {
      const res = await auditService.getSummary(query);
      return auditSummarySchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useAuditCatalog = () =>
  useQuery({
    queryKey: auditKeys.catalog(),
    queryFn: async () => {
      const res = await auditService.getCatalog();
      return auditCatalogSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

export const useAuditLogs = (query?: AuditLogQuery, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: auditKeys.logs(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await auditService.listLogs(query);
      return {
        items: auditLogSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

export const useAuditLog = (auditLogId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: auditKeys.log(auditLogId),
    enabled: Boolean(auditLogId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await auditService.getLog(auditLogId!);
      return auditLogSchema.parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

export const useAuditEntityLogs = (
  entityType?: string,
  entityId?: string,
  query?: AuditEntityQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: auditKeys.entityLogs(entityType, entityId, query),
    enabled: Boolean(entityType && entityId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await auditService.listEntityLogs(entityType!, entityId!, query);
      return {
        items: auditLogSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useAuditActorUserLogs = (
  actorUserId?: string,
  query?: AuditActorQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: auditKeys.actorUserLogs(actorUserId, query),
    enabled: Boolean(actorUserId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await auditService.listActorUserLogs(actorUserId!, query);
      return {
        items: auditLogSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useAuditActorMemberLogs = (
  actorMemberId?: string,
  query?: AuditActorQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: auditKeys.actorMemberLogs(actorMemberId, query),
    enabled: Boolean(actorMemberId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await auditService.listActorMemberLogs(actorMemberId!, query);
      return {
        items: auditLogSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
