import { useEffect } from "react";
import { useSocket } from "@/shared/hooks/useSocket";
import type { AgogeSocketEvent } from "@/shared/realtime/socket-client";

export const useSocketEvent = <T = unknown>(
  event: AgogeSocketEvent,
  handler: (payload: T) => void,
) => {
  const { socket, isEnabled } = useSocket();

  useEffect(() => {
    if (!socket || !isEnabled) return;

    socket.on(event, handler as never);

    return () => {
      socket.off(event, handler as never);
    };
  }, [event, handler, isEnabled, socket]);
};
