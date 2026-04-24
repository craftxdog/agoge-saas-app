import { useQueryClient } from "@tanstack/react-query";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSocketEvent } from "@/shared/hooks/useSocketEvent";
import {
  realtimeEvents,
  resolveRealtimeQueryKeys,
  type RealtimeEventPayload,
} from "./socket-contract";

const customerSafeQueryRoots = new Set(["analytics", "billing", "schedules"]);

export const useRealtimeQuerySync = () => {
  const queryClient = useQueryClient();
  const { isCustomerPortal } = useAccessContext();

  useSocketEvent<RealtimeEventPayload>(realtimeEvents, (payload, event) => {
    const queryKeys = resolveRealtimeQueryKeys(event, payload);

    queryKeys.forEach((queryKey) => {
      if (isCustomerPortal && !customerSafeQueryRoots.has(queryKey)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: [queryKey] });
    });
  });
};
