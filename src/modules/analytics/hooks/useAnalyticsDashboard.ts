import { useQuery } from "@tanstack/react-query";
import {
  analyticsDashboardSchema,
  type AnalyticsQuery,
} from "../schemas/analytics.schema";
import { analyticsService } from "../services/analytics.service";

export const useAnalyticsDashboard = (query?: AnalyticsQuery) =>
  useQuery({
    queryKey: ["analytics", "dashboard", query],
    queryFn: async () => {
      const res = await analyticsService.getDashboard(query);
      return analyticsDashboardSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
