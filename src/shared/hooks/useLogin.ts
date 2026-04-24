import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { setToken } from "@/shared/api/auth-token";
import { useAuth } from "@/shared/hooks/useAuth";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    retry: false,
    onSuccess: (res) => {
      const session = authSessionSchema.parse(res.data);

      setToken(session.tokens.accessToken);
      login(session);

      if (!session.activeMembership && session.memberships.length > 1) {
        toast("Elige tu organizacion para continuar.");
      }

      navigate("/app");
    },
    onError: () => {
      toast.error("No pudimos iniciar sesion. Revisa tus credenciales.");
    },
  });
};
