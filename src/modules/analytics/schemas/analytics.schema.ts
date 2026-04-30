import { z } from "zod";

export const analyticsRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
  groupBy: z.enum(["day", "week", "month"]).or(z.string()),
});

export const moneyMetricSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const rateMetricSchema = z.object({
  percentage: z.number(),
});

export const dimensionCountSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
});

export const dimensionAmountSchema = dimensionCountSchema.extend({
  amount: z.number(),
  currency: z.string(),
});

export const trendPointSchema = z.object({
  bucket: z.string(),
  start: z.string(),
  end: z.string(),
  invoicedAmount: z.number(),
  collectedAmount: z.number(),
  newMembers: z.number(),
  invitations: z.number(),
});

export const analyticsRevenueSchema = z.object({
  range: analyticsRangeSchema,
  invoiced: moneyMetricSchema,
  collected: moneyMetricSchema,
  outstanding: moneyMetricSchema,
  overdue: moneyMetricSchema,
  collectionRate: rateMetricSchema,
  statusBreakdown: z.array(dimensionCountSchema),
  topPaymentTypes: z.array(dimensionAmountSchema),
  collectedByMethod: z.array(dimensionAmountSchema),
  trend: z.array(trendPointSchema),
});

export const analyticsMembersSchema = z.object({
  range: analyticsRangeSchema,
  currentMembers: z.number(),
  activeMembers: z.number(),
  invitedMembers: z.number(),
  suspendedMembers: z.number(),
  removedMembers: z.number(),
  newMembers: z.number(),
  pendingInvitations: z.number(),
  acceptedInvitations: z.number(),
  invitationAcceptanceRate: rateMetricSchema,
  statusBreakdown: z.array(dimensionCountSchema),
  trend: z.array(trendPointSchema),
});

export const analyticsOperationsSchema = z.object({
  range: analyticsRangeSchema,
  totalLocations: z.number(),
  activeLocations: z.number(),
  businessHourWindows: z.number(),
  memberScheduleWindows: z.number(),
  scheduledMembers: z.number(),
  scheduleCoverageRate: rateMetricSchema,
  unreadNotifications: z.number(),
  upcomingExceptions: z.number(),
  auditEvents: z.number(),
  enabledModulesCount: z.number(),
  enabledModules: z.array(z.string()),
  topAuditActions: z.array(dimensionCountSchema),
  recentNotifications: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        message: z.string(),
        isRead: z.boolean(),
        createdAt: z.string(),
      }),
    )
    .default([]),
});

export const overviewCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  valueType: z.string(),
  value: z.number(),
  currency: z.string().optional(),
});

export const analyticsInsightSchema = z.object({
  severity: z.string(),
  metricKey: z.string(),
  title: z.string(),
  message: z.string(),
});

export const analyticsDashboardSchema = z.object({
  generatedAt: z.string(),
  range: analyticsRangeSchema,
  overview: z.object({
    cards: z.array(overviewCardSchema),
  }),
  revenue: analyticsRevenueSchema,
  members: analyticsMembersSchema,
  operations: analyticsOperationsSchema,
  insights: z.array(analyticsInsightSchema),
});

export const analyticsCatalogItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
});

export const analyticsCatalogSchema = z.object({
  paymentTypes: z.array(analyticsCatalogItemSchema),
  paymentMethods: z.array(analyticsCatalogItemSchema),
  locations: z.array(analyticsCatalogItemSchema),
  currencies: z.array(z.string()),
  enabledModules: z.array(z.string()),
});

export type AnalyticsGroupBy = "day" | "week" | "month";
export type AnalyticsQuery = {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: AnalyticsGroupBy;
  top?: number;
};
export type AnalyticsDashboard = z.infer<typeof analyticsDashboardSchema>;
export type AnalyticsRevenue = z.infer<typeof analyticsRevenueSchema>;
export type AnalyticsMembers = z.infer<typeof analyticsMembersSchema>;
export type AnalyticsOperations = z.infer<typeof analyticsOperationsSchema>;
export type AnalyticsCatalog = z.infer<typeof analyticsCatalogSchema>;
export type AnalyticsInsight = z.infer<typeof analyticsInsightSchema>;
export type AnalyticsTrendPoint = z.infer<typeof trendPointSchema>;
export type AnalyticsDimensionAmount = z.infer<typeof dimensionAmountSchema>;
