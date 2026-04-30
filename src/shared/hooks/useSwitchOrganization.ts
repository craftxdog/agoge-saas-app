import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authSessionSchema } from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { setToken } from "@/shared/api/auth-token";
import { useNotificationStore } from "@/shared/store/notification.store";
import { useAuthStore } from "@/shared/store/auth.store";

export const useSwitchOrganization = () => {
  const { setSession } = useAuthStore();
  const resetNotifications = useNotificationStore((state) => state.reset);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      authService.switchOrganization(organizationId),
    onSuccess: async (res) => {
      const session = authSessionSchema.parse(res.data);
      setToken(session.tokens.accessToken);
      setSession(session);
      resetNotifications();

      await Promise.all([
        queryClient.resetQueries({ queryKey: ["analytics"] }),
        queryClient.resetQueries({ queryKey: ["audit"] }),
        queryClient.resetQueries({ queryKey: ["billing"] }),
        queryClient.resetQueries({ queryKey: ["notifications"] }),
        queryClient.resetQueries({ queryKey: ["rbac"] }),
        queryClient.resetQueries({ queryKey: ["schedules"] }),
        queryClient.resetQueries({ queryKey: ["settings"] }),
        queryClient.resetQueries({ queryKey: ["users"] }),
        queryClient.resetQueries({ queryKey: ["tenant-branding"] }),
        queryClient.removeQueries({ queryKey: ["me"] }),
      ]);

      toast.success("Organizacion activa actualizada.");
    },
    onError: () => {
      toast.error("No pudimos cambiar de organizacion.");
    },
  });
};
