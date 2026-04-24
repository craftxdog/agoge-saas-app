import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthStore } from "@/shared/store/auth.store";
import {
  configureSocketAuth,
  createSocketClient,
  type AgogeSocket,
} from "./socket-client";

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

  const socket = useMemo(() => (enabled ? createSocketClient() : null), [enabled]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const handleConnect = () => {
      setIsConnected(true);
      setLastError(null);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setLastError(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [enabled, socket]);

  useEffect(() => {
    if (!socket || !enabled) return;

    if (!token) {
      socket.disconnect();
      return;
    }

    configureSocketAuth({
      token,
      organizationId: activeMembership?.organization.id,
      memberId: activeMembership?.id,
    });

    if (!socket.connected) {
      socket.connect();
    }

    if (activeMembership?.organization.id) {
      socket.emit("tenant:join", {
        organizationId: activeMembership.organization.id,
      });
    }

    return () => {
      if (activeMembership?.organization.id && socket.connected) {
        socket.emit("tenant:leave", {
          organizationId: activeMembership.organization.id,
        });
      }
    };
  }, [activeMembership?.id, activeMembership?.organization.id, enabled, socket, token]);

  useEffect(() => {
    if (!socket || enabled) return;

    socket.disconnect();
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
        isConnected,
        connectionState,
        lastError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
export { SocketContext };
