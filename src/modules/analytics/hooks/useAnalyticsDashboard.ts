import { useQuery } from "@tanstack/react-query";
import {
  analyticsDashboardSchema,
  analyticsSelfDashboardSchema,
  type AnalyticsQuery,
} from "../schemas/analytics.schema";
import { analyticsService } from "../services/analytics.service";

export const useAnalyticsDashboard = (
  query?: AnalyticsQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["analytics", "dashboard", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getDashboard(query);
      return analyticsDashboardSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useSelfAnalyticsDashboard = (
  query?: AnalyticsQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["analytics", "self-dashboard", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getSelfDashboard(query);
      return analyticsSelfDashboardSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
