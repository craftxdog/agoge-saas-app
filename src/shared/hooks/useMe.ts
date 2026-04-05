import { useQuery } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuth } from "@/shared/hooks/useAuth";

export const useMe = () => {
  const { login, logout } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await authService.me();

      login({
        user: data.user,
        token: localStorage.getItem("token")!,
      });

      return data;
    },
  });
};
