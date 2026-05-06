import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  NotificationItem,
  NotificationQuery,
  NotificationSummary,
} from "@/modules/notifications/schemas/notifications.schema";

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

export const activityService = {
  getSummary: () => http.get<ApiResponse<NotificationSummary>>("/activity/summary"),

  listActivity: (query?: NotificationQuery) =>
    http.get<ApiResponse<NotificationItem[] | { items: NotificationItem[] }>>(
      withQuery("/activity", query),
    ),

  markAsRead: (notificationId: string) =>
    http.patch<ApiResponse<{ id: string; isRead: boolean }>>(
      `/activity/${notificationId}/read`,
    ),

  markAllAsRead: () =>
    http.patch<ApiResponse<{ updatedCount: number }>>("/activity/read-all"),
};
