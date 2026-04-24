import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getToken } from "@/shared/api/auth-token";
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
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isEnabled: false,
  isConnected: false,
});

const isRealtimeEnabled = () => import.meta.env.VITE_SOCKET_ENABLED === "true";

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const [isConnected, setIsConnected] = useState(false);
  const enabled = isRealtimeEnabled();

  const socket = useMemo(() => (enabled ? createSocketClient() : null), [enabled]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [enabled, socket]);

  useEffect(() => {
    if (!socket || !enabled) return;

    const accessToken = getToken();

    if (!accessToken) {
      socket.disconnect();
      return;
    }

    configureSocketAuth({
      token: accessToken,
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

  return (
    <SocketContext.Provider
      value={{
        socket,
        isEnabled: enabled,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
export { SocketContext };
