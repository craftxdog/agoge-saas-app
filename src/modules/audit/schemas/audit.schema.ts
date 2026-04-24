import { z } from "zod";

export const auditActorUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
});

export const auditActorMemberSchema = z.object({
  id: z.string(),
  user: auditActorUserSchema,
});

export const auditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable().optional(),
  actorUser: auditActorUserSchema.nullable().optional(),
  actorMember: auditActorMemberSchema.nullable().optional(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  metadata: z.unknown().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const auditDimensionSchema = z.object({
  key: z.string(),
  count: z.number(),
});

export const auditSummarySchema = z.object({
  totalEvents: z.number(),
  byAction: auditDimensionSchema.array(),
  byEntityType: auditDimensionSchema.array(),
  recentEvents: auditLogSchema.array(),
});

export const auditCatalogSchema = z.object({
  actions: z.string().array(),
  entityTypes: z.string().array(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type AuditSummary = z.infer<typeof auditSummarySchema>;
export type AuditCatalog = z.infer<typeof auditCatalogSchema>;

export type AuditSummaryQuery = {
  dateFrom?: string;
  dateTo?: string;
};

export type AuditLogQuery = {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  actorMemberId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "action" | "entityType";
  sortDirection?: "asc" | "desc";
};

export type AuditEntityQuery = {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt";
  sortDirection?: "asc" | "desc";
};

export type AuditActorQuery = {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt";
  sortDirection?: "asc" | "desc";
};
