import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  NotificationItem,
  NotificationQuery,
  NotificationSummary,
} from "../schemas/notifications.schema";

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

export const notificationsService = {
  getSummary: () => http.get<ApiResponse<NotificationSummary>>("/notifications/summary"),

  listNotifications: (query?: NotificationQuery) =>
    http.get<ApiResponse<NotificationItem[] | { items: NotificationItem[] }>>(
      withQuery("/notifications", query),
    ),

  markAsRead: (notificationId: string) =>
    http.patch<ApiResponse<{ id: string; isRead: boolean }>>(
      `/notifications/${notificationId}/read`,
    ),

  markAllAsRead: () =>
    http.patch<ApiResponse<{ updatedCount: number }>>("/notifications/read-all"),
};
