import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/shared/store/auth.store";
import {
  AUTH_TOKEN_EVENT,
  getToken,
} from "@/shared/api/auth-token";
import {
  configureSocketAuth,
  createSocketClient,
  type AgogeSocket,
} from "./socket-client";
import type {
  RealtimeConnectionSnapshot,
  RealtimeErrorPayload,
} from "./socket-contract";

type SocketContextValue = {
  socket: AgogeSocket | null;
  isEnabled: boolean;
  isConnected: boolean;
  connectionState: "disabled" | "connecting" | "connected" | "disconnected";
  lastError: string | null;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isEnabled: false,
  isConnected: false,
  connectionState: "disabled",
  lastError: null,
});

const isRealtimeEnabled = () => import.meta.env.VITE_SOCKET_ENABLED === "true";

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const enabled = isRealtimeEnabled();
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RealtimeConnectionSnapshot | null>(null);

  const socket = useMemo(() => (enabled ? createSocketClient() : null), [enabled]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const handleConnect = () => {
      setIsConnected(true);
      setLastError(null);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setSnapshot(null);
    };
    const handleRealtimeSnapshot = (value: RealtimeConnectionSnapshot) => {
      setSnapshot(value);
    };
    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setLastError(error.message);
    };
    const handleRealtimeError = (error: RealtimeErrorPayload) => {
      setLastError(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("realtime.connected", handleRealtimeSnapshot);
    socket.on("realtime.context", handleRealtimeSnapshot);
    socket.on("realtime.error", handleRealtimeError);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("realtime.connected", handleRealtimeSnapshot);
      socket.off("realtime.context", handleRealtimeSnapshot);
      socket.off("realtime.error", handleRealtimeError);
      socket.off("connect_error", handleConnectError);
    };
  }, [enabled, socket]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const accessToken = token ?? getToken();

    if (!accessToken) {
      socket.disconnect();
      return;
    }

    configureSocketAuth(accessToken);

    if (socket.connected) {
      socket.emit("realtime.sync", { accessToken });
      return;
    }

    socket.connect();
  }, [activeMembership?.id, activeMembership?.organization.id, enabled, socket, token]);

  useEffect(() => {
    if (!socket || enabled) return;

    socket.disconnect();
  }, [enabled, socket]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const handleTokenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string | null }>;
      const nextToken = customEvent.detail?.token ?? null;

      if (!nextToken) {
        socket.disconnect();
        setSnapshot(null);
        return;
      }

      configureSocketAuth(nextToken);

      if (socket.connected) {
        socket.emit("realtime.sync", { accessToken: nextToken });
        return;
      }

      socket.connect();
    };

    window.addEventListener(AUTH_TOKEN_EVENT, handleTokenEvent);

    return () => {
      window.removeEventListener(AUTH_TOKEN_EVENT, handleTokenEvent);
    };
  }, [enabled, socket]);

  const connectionState = !enabled
    ? "disabled"
    : isConnected
      ? "connected"
      : socket?.active
        ? "connecting"
        : "disconnected";

  return (
    <SocketContext.Provider
      value={{
        socket,
        isEnabled: enabled,
        isConnected: isConnected && Boolean(snapshot),
        connectionState,
        lastError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
export { SocketContext };
