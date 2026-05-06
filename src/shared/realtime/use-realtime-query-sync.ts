import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSocketEvent } from "@/shared/hooks/useSocketEvent";
import {
  resolveRealtimeQueryRoots,
  type RealtimeEventEnvelope,
} from "./socket-contract";

export const useRealtimeQuerySync = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  useSocketEvent<RealtimeEventEnvelope>("realtime.event", (payload) => {
    const queryKeys = resolveRealtimeQueryRoots(payload);

    queryKeys.forEach((queryKey) => {
      const canReadTenantRoot =
        (queryKey === "analytics" && hasPermission("analytics.read")) ||
        (queryKey === "audit" && hasPermission("audit.read")) ||
        (queryKey === "billing" && hasPermission("billing.read")) ||
        (queryKey === "notifications" && hasPermission("notifications.read")) ||
        (queryKey === "rbac" && hasPermission("roles.manage")) ||
        (queryKey === "schedules" && hasPermission("schedules.read")) ||
        (queryKey === "settings" && hasPermission("settings.read")) ||
        (queryKey === "users" && hasPermission("users.read")) ||
        (queryKey === "activity" && hasPermission("notifications.self.read"));

      if (canReadTenantRoot) {
        void queryClient.invalidateQueries({ queryKey: [queryKey] });
        void queryClient.refetchQueries({ queryKey: [queryKey], type: "active" });
        return;
      }

      if (queryKey === "billing" && hasPermission("billing.self.read")) {
        void queryClient.invalidateQueries({ queryKey: ["billing"] });
        void queryClient.refetchQueries({ queryKey: ["billing"], type: "active" });
      }

      if (queryKey === "schedules" && hasPermission("schedules.self.read")) {
        void queryClient.invalidateQueries({ queryKey: ["schedules"] });
        void queryClient.refetchQueries({ queryKey: ["schedules"], type: "active" });
      }

      if (queryKey === "analytics" && hasPermission("analytics.self.read")) {
        void queryClient.invalidateQueries({ queryKey: ["analytics", "self-dashboard"] });
        void queryClient.refetchQueries({
          queryKey: ["analytics", "self-dashboard"],
          type: "active",
        });
      }

      if (
        (queryKey === "notifications" || queryKey === "activity") &&
        hasPermission("notifications.self.read")
      ) {
        void queryClient.invalidateQueries({ queryKey: ["activity"] });
        void queryClient.refetchQueries({ queryKey: ["activity"], type: "active" });
        void queryClient.invalidateQueries({ queryKey: ["analytics", "self-dashboard"] });
      }
    });
  });
};
