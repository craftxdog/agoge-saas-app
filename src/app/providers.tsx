import { Spinner } from "@/components/ui/spinner";
import { useMe } from "@/shared/hooks/useMe";
import { SocketProvider } from "@/shared/realtime/socket-provider";
import { useAuthStore } from "@/shared/store/auth.store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <AuthInitializer >
          {children}
        </AuthInitializer>
      </SocketProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

function AuthInitializer({ children }: { children: ReactNode }) {
  const { isHydrated, setHydrated } = useAuthStore();
  const { isLoading } = useMe();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setHydrated(true);
    }
  }, [setHydrated, token]);

  if (!token) {
    return <>{children}</>;
  }

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="text-xl font-semibold">Agoge</div>
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Inicializando app...</p>
      </div>
    );
  }

  return <>{children}</>;
}
