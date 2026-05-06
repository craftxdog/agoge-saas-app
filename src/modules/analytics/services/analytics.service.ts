import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  AnalyticsDashboard,
  AnalyticsCatalog,
  AnalyticsQuery,
  AnalyticsRevenue,
  AnalyticsMembers,
  AnalyticsOperations,
  AnalyticsSelfDashboard,
} from "../schemas/analytics.schema";

const toSearchParams = (query?: AnalyticsQuery) => {
  const params = new URLSearchParams();

  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  if (query?.groupBy) params.set("groupBy", query.groupBy);
  if (query?.top) params.set("top", String(query.top));

  return params.toString();
};

const withQuery = (path: string, query?: AnalyticsQuery) => {
  const params = toSearchParams(query);
  return params ? `${path}?${params}` : path;
};

export const analyticsService = {
  getSelfDashboard: (query?: AnalyticsQuery) =>
    http.get<ApiResponse<AnalyticsSelfDashboard>>(
      withQuery("/analytics/me/dashboard", query),
    ),

  getDashboard: (query?: AnalyticsQuery) =>
    http.get<ApiResponse<AnalyticsDashboard>>(withQuery("/analytics/dashboard", query)),

  getRevenue: (query?: AnalyticsQuery) =>
    http.get<ApiResponse<AnalyticsRevenue>>(
      withQuery("/analytics/revenue", query),
    ),

  getMembers: (query?: AnalyticsQuery) =>
    http.get<ApiResponse<AnalyticsMembers>>(
      withQuery("/analytics/members", query),
    ),

  getOperations: (query?: AnalyticsQuery) =>
    http.get<ApiResponse<AnalyticsOperations>>(
      withQuery("/analytics/operations", query),
    ),

  getCatalog: () =>
    http.get<ApiResponse<AnalyticsCatalog>>("/analytics/catalog"),
};
