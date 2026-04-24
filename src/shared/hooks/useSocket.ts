import { useContext } from "react";
import { SocketContext } from "@/shared/realtime/socket-provider";

export const useSocket = () => useContext(SocketContext);
