import { http } from "@/shared/api/http";
import type { LoginSchema, RegisterSchema } from "../schemas/auth.schema";

export type RegisterPayload = Omit<RegisterSchema, "confirmPassword">;
type AuthResponse = {
  user: {
    id: string;
    email: string;
    role: string;
  };
  accessToken: string;
};
export const authService = {
  login: (data: LoginSchema) =>
    http.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterPayload) =>
    http.post<AuthResponse>("/auth/register", data),

  me: () =>
    http.get<{ user: AuthResponse["user"] }>("/auth/me"),
};
