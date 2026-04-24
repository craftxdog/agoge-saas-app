import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { meSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "../store/auth.store";

export const useMe = () => {
  const { setSession, setHydrated, logout } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const hasInitialized = useRef(false);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data && !hasInitialized.current) {
      hasInitialized.current = true;
      const session = meSessionSchema.parse(query.data.data);
      setSession(session, token ?? undefined);
    }
  }, [query.data, setSession, token]);

  useEffect(() => {
    if (query.isError) {
      logout();
      setHydrated(true);
    }
  }, [logout, query.isError, setHydrated]);

  return query;
};
