import { io, type Socket } from "socket.io-client";
import { baseURL } from "@/shared/api/client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RealtimeEventName,
} from "./socket-contract";

export type AgogeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type AgogeSocketEvent = RealtimeEventName;

const resolveSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (configuredUrl) return configuredUrl;

  try {
    const apiUrl = new URL(baseURL, window.location.origin);
    return apiUrl.origin;
  } catch {
    return window.location.origin;
  }
};

const resolveSocketNamespace = () => {
  const namespace = import.meta.env.VITE_SOCKET_NAMESPACE?.trim() || "/realtime";
  return namespace.startsWith("/") ? namespace : `/${namespace}`;
};

let socketInstance: AgogeSocket | null = null;

export const createSocketClient = () => {
  if (socketInstance) return socketInstance;

  socketInstance = io(`${resolveSocketUrl()}${resolveSocketNamespace()}`, {
    path: import.meta.env.VITE_SOCKET_PATH || "/socket.io",
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
  });

  return socketInstance;
};

export const getSocketClient = () => socketInstance ?? createSocketClient();

export const configureSocketAuth = (token: string) => {
  const socket = getSocketClient();
  socket.auth = {
    token,
    accessToken: token,
  };
  return socket;
};
