import {
  keepPreviousData,
  useMutation,
  useQuery,
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  notificationListPayloadSchema,
  notificationSchema,
  notificationSummarySchema,
  type NotificationQuery,
} from "@/modules/notifications/schemas/notifications.schema";
import { activityService } from "../services/activity.service";

export const activityKeys = {
  all: ["activity"] as const,
  summary: () => [...activityKeys.all, "summary"] as const,
  list: (query?: NotificationQuery) =>
    [...activityKeys.all, "list", query] as const,
};

export const useActivitySummary = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: activityKeys.summary(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await activityService.getSummary();
      return notificationSummarySchema.parse(res.data);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

export const useActivity = (
  query?: NotificationQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: activityKeys.list(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await activityService.listActivity(query);
      const payload = notificationListPayloadSchema.parse(res.data);

      if (Array.isArray(payload)) {
        return {
          items: notificationSchema.array().parse(payload),
          pagination: res.meta.pagination,
        };
      }

      return {
        items: notificationSchema.array().parse(payload.items),
        pagination: res.meta.pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 15,
    refetchOnWindowFocus: false,
  });

const invalidateActivityQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["analytics", "self-dashboard"] }),
  ]);
};

export const useMarkActivityAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => activityService.markAsRead(notificationId),
    onSuccess: async () => {
      await invalidateActivityQueries(queryClient);
    },
    onError: () => {
      toast.error("No pudimos marcar la actividad.");
    },
  });
};

export const useMarkAllActivityAsRead = (options?: { showSuccessToast?: boolean }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activityService.markAllAsRead(),
    onSuccess: async () => {
      await invalidateActivityQueries(queryClient);
      if (options?.showSuccessToast ?? true) {
        toast.success("Tu actividad quedo marcada como leida.");
      }
    },
    onError: () => {
      toast.error("No pudimos marcar tu actividad.");
    },
  });
};
