import { useMutation } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuth } from "@/shared/hooks/useAuth";

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login({
        user: data.user,
        token: data.accessToken,
      });
    },
  });
};
