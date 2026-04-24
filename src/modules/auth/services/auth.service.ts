import { http } from "@/shared/api/http";
import type {
  AuthSession,
  LoginSchema,
  MeSession,
  RegisterOrganizationPayload,
} from "../schemas/auth.schema";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta: {
    statusCode: number;
    timestamp: string;
    path: string;
    requestId: string;
  };
};

export const authService = {
  login: (data: LoginSchema) =>
    http.post<ApiEnvelope<AuthSession>, LoginSchema>("/auth/login", data),

  registerOrganization: (data: RegisterOrganizationPayload) =>
    http.post<ApiEnvelope<AuthSession>, RegisterOrganizationPayload>(
      "/auth/register-organization",
      data,
    ),

  me: () => http.get<ApiEnvelope<MeSession>>("/auth/me"),

  refresh: () => http.post<ApiEnvelope<AuthSession>>("/auth/refresh"),

  switchOrganization: (organizationId: string) =>
    http.post<ApiEnvelope<AuthSession>, { organizationId: string }>(
      "/auth/switch-organization",
      { organizationId },
    ),

  logout: () => http.post<ApiEnvelope<{ ok: boolean }>>("/auth/logout"),
};
