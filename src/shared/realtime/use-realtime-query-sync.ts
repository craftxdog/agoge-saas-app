import { useQueryClient } from "@tanstack/react-query";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSocketEvent } from "@/shared/hooks/useSocketEvent";
import {
  resolveRealtimeQueryRoots,
  type RealtimeEventEnvelope,
} from "./socket-contract";

const customerSafeQueryRoots = new Set(["billing", "schedules"]);

export const useRealtimeQuerySync = () => {
  const queryClient = useQueryClient();
  const { isCustomerPortal } = useAccessContext();

  useSocketEvent<RealtimeEventEnvelope>("realtime.event", (payload) => {
    const queryKeys = resolveRealtimeQueryRoots(payload);

    queryKeys.forEach((queryKey) => {
      if (isCustomerPortal && !customerSafeQueryRoots.has(queryKey)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      void queryClient.refetchQueries({ queryKey: [queryKey], type: "active" });
    });
  });
};
