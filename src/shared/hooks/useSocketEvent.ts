import { useEffect, useEffectEvent } from "react";
import { useSocket } from "@/shared/hooks/useSocket";
import type { AgogeSocketEvent } from "@/shared/realtime/socket-client";

export const useSocketEvent = <T = unknown>(
  event: AgogeSocketEvent | readonly AgogeSocketEvent[],
  handler: (payload: T, event: AgogeSocketEvent) => void,
) => {
  const { socket, isEnabled } = useSocket();
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    if (!socket || !isEnabled) return;

    const events = Array.isArray(event) ? event : [event];
    const listeners = events.map((currentEvent) => {
      const listener = (payload: T) => onEvent(payload, currentEvent);
      socket.on(currentEvent, listener as never);
      return { event: currentEvent, listener };
    });

    return () => {
      listeners.forEach(({ event: currentEvent, listener }) => {
        socket.off(currentEvent, listener as never);
      });
    };
  }, [event, isEnabled, socket]);
};
