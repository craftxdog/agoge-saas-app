import { useMutation } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/shared/store/auth.store";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../api/auth-token";

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      removeToken();
      logout();
      navigate("/login");
    },
    onError: () => {
      removeToken();
      logout();
      navigate("/login");
    },
  });
};
