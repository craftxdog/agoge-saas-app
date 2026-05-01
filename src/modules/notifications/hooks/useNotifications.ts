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
} from "../schemas/notifications.schema";
import { notificationsService } from "../services/notifications.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  summary: () => [...notificationKeys.all, "summary"] as const,
  list: (query?: NotificationQuery) =>
    [...notificationKeys.all, "list", query] as const,
};

export const useNotificationSummary = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: notificationKeys.summary(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await notificationsService.getSummary();
      return notificationSummarySchema.parse(res.data);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

export const useNotifications = (
  query?: NotificationQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: notificationKeys.list(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await notificationsService.listNotifications(query);
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

const invalidateNotificationQueries = async (
  queryClient: QueryClient,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    queryClient.invalidateQueries({ queryKey: ["analytics", "operations"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] }),
  ]);
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markAsRead(notificationId),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
    },
    onError: () => {
      toast.error("No pudimos marcar la notificacion.");
    },
  });
};

export const useMarkAllNotificationsAsRead = (options?: {
  showSuccessToast?: boolean;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
      if (options?.showSuccessToast ?? true) {
        toast.success("La bandeja quedo marcada como leida.");
      }
    },
    onError: () => {
      toast.error("No pudimos marcar la bandeja como leida.");
    },
  });
};
