import { useQuery } from "@tanstack/react-query";
import {
  analyticsCatalogSchema,
  analyticsMembersSchema,
  analyticsOperationsSchema,
  analyticsRevenueSchema,
  type AnalyticsQuery,
} from "../schemas/analytics.schema";
import { analyticsService } from "../services/analytics.service";

export const useAnalyticsRevenue = (
  query?: AnalyticsQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["analytics", "revenue", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getRevenue(query);
      return analyticsRevenueSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useAnalyticsMembers = (
  query?: AnalyticsQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["analytics", "members", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getMembers(query);
      return analyticsMembersSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useAnalyticsOperations = (
  query?: AnalyticsQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["analytics", "operations", query],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getOperations(query);
      return analyticsOperationsSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useAnalyticsCatalog = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["analytics", "catalog"],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await analyticsService.getCatalog();
      return analyticsCatalogSchema.parse(res.data);
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
