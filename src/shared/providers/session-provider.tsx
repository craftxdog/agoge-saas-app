/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { meSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { AUTH_TOKEN_EVENT } from "@/shared/api/auth-token";
import { useAuthStore } from "@/shared/store/auth.store";

type SessionContextValue = {
  isInitializing: boolean;
  hasSession: boolean;
  refreshSession: () => Promise<unknown>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const meQuery = useQuery({
    queryKey: ["me", token],
    queryFn: authService.me,
    enabled: Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!token) {
      setHydrated(true);
    }
  }, [setHydrated, token]);

  useEffect(() => {
    if (!meQuery.data) return;

    const session = meSessionSchema.parse(meQuery.data.data);
    setSession(session, token ?? undefined);
  }, [meQuery.data, setSession, token]);

  useEffect(() => {
    if (!meQuery.isError) return;

    logout();
    setHydrated(true);
  }, [logout, meQuery.isError, setHydrated]);

  useEffect(() => {
    const handleTokenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string | null }>;
      setAccessToken(customEvent.detail?.token ?? null);
    };

    window.addEventListener(AUTH_TOKEN_EVENT, handleTokenEvent);

    return () => {
      window.removeEventListener(AUTH_TOKEN_EVENT, handleTokenEvent);
    };
  }, [setAccessToken]);

  const isInitializing = Boolean(token) && (!isHydrated || meQuery.isLoading);
  const value = useMemo<SessionContextValue>(
    () => ({
      isInitializing,
      hasSession: Boolean(token),
      refreshSession: async () => meQuery.refetch(),
    }),
    [isInitializing, meQuery, token],
  );

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="text-xl font-semibold">Agoge</div>
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Inicializando app...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSessionContext = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }

  return context;
};
