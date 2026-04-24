import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { setToken } from "@/shared/api/auth-token";
import { useAuthStore } from "@/shared/store/auth.store";

export const useSwitchOrganization = () => {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: (organizationId: string) =>
      authService.switchOrganization(organizationId),
    onSuccess: (res) => {
      const session = authSessionSchema.parse(res.data);
      setToken(session.tokens.accessToken);
      setSession(session);
      toast.success("Organizacion activa actualizada.");
    },
    onError: () => {
      toast.error("No pudimos cambiar de organizacion.");
    },
  });
};
