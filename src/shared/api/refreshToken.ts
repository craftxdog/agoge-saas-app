import { authService } from "@/modules/auth/services/auth.service";

export const refreshToken = async () => {
  const res = await authService.refresh();
  return res.data.tokens.accessToken;
};
