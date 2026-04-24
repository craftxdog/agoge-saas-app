import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  CreateOrganizationScreen,
  OrganizationModule,
  OrganizationProfile,
  OrganizationScreen,
  OrganizationSetting,
  OrganizationSettingInput,
  UpdateOrganizationBranding,
  UpdateOrganizationModule,
  UpdateOrganizationProfile,
  UpdateOrganizationScreen,
} from "../schemas/settings.schema";

export const settingsService = {
  getOrganization: () =>
    http.get<ApiResponse<OrganizationProfile>>("/settings/organization"),

  updateOrganization: (data: UpdateOrganizationProfile) =>
    http.patch<ApiResponse<OrganizationProfile>, UpdateOrganizationProfile>(
      "/settings/organization",
      data,
    ),

  updateBranding: (data: UpdateOrganizationBranding) =>
    http.put<ApiResponse<OrganizationProfile["branding"]>, UpdateOrganizationBranding>(
      "/settings/branding",
      data,
    ),

  uploadBrandingLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.postForm<ApiResponse<OrganizationProfile["branding"]>>(
      "/settings/branding/logo",
      formData,
    );
  },

  uploadBrandingIcon: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.postForm<ApiResponse<OrganizationProfile["branding"]>>(
      "/settings/branding/icon",
      formData,
    );
  },

  listModules: () =>
    http.get<ApiResponse<OrganizationModule[]>>("/settings/modules"),

  updateModule: (moduleKey: string, data: UpdateOrganizationModule) =>
    http.patch<ApiResponse<OrganizationModule>, UpdateOrganizationModule>(
      `/settings/modules/${moduleKey}`,
      data,
    ),

  listScreens: () =>
    http.get<ApiResponse<OrganizationScreen[]>>("/settings/screens"),

  createScreen: (data: CreateOrganizationScreen) =>
    http.post<ApiResponse<OrganizationScreen>, CreateOrganizationScreen>(
      "/settings/screens",
      data,
    ),

  updateScreen: (screenId: string, data: UpdateOrganizationScreen) =>
    http.patch<ApiResponse<OrganizationScreen>, UpdateOrganizationScreen>(
      `/settings/screens/${screenId}`,
      data,
    ),

  deleteScreen: (screenId: string) =>
    http.delete<ApiResponse<OrganizationScreen>>(`/settings/screens/${screenId}`),

  listPreferences: (namespace?: string) =>
    http.get<ApiResponse<OrganizationSetting[]>>(
      namespace
        ? `/settings/preferences?namespace=${encodeURIComponent(namespace)}`
        : "/settings/preferences",
    ),

  upsertPreferences: (settings: OrganizationSettingInput[]) =>
    http.put<ApiResponse<OrganizationSetting[]>, { settings: OrganizationSettingInput[] }>(
      "/settings/preferences",
      { settings },
    ),
};
