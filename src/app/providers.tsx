import { NavigationProvider } from "@/shared/providers/navigation-provider";
import { SessionProvider } from "@/shared/providers/session-provider";
import { SocketProvider } from "@/shared/realtime/socket-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NavigationProvider>
          <SocketProvider>{children}</SocketProvider>
        </NavigationProvider>
      </SessionProvider>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
