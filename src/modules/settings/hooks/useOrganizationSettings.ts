import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/shared/hooks/useAuth";
import { rbacKeys } from "@/modules/rbac/hooks/useRbac";
import {
  organizationModuleSchema,
  type OrganizationModule,
  type OrganizationProfile,
  organizationProfileSchema,
  organizationScreenSchema,
  organizationSettingSchema,
  type CreateOrganizationScreen,
  type OrganizationSettingInput,
  type UpdateOrganizationBranding,
  type UpdateOrganizationModule,
  type UpdateOrganizationProfile,
  type UpdateOrganizationScreen,
} from "../schemas/settings.schema";
import { settingsService } from "../services/settings.service";
import {
  persistAndApplyTenantBranding,
  storeBrandAssetVersion,
} from "../utils/tenant-branding";
import { useAuthStore } from "@/shared/store/auth.store";

export const organizationSettingsKeys = {
  all: ["settings"] as const,
  organization: () => [...organizationSettingsKeys.all, "organization"] as const,
  modules: () => [...organizationSettingsKeys.all, "modules"] as const,
  screens: () => [...organizationSettingsKeys.all, "screens"] as const,
  preferences: (namespace?: string) =>
    [...organizationSettingsKeys.all, "preferences", namespace ?? "all"] as const,
};

const syncEnabledModulesInSession = (modules: OrganizationModule[]) => {
  const enabledModules = modules
    .filter((item) => item.isEnabled)
    .map((item) => item.module.key);

  useAuthStore.getState().syncActiveMembershipModules(enabledModules);
};

const syncBrandingInCache = ({
  queryClient,
  organizationId,
  branding,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
  organizationId?: string;
  branding: OrganizationProfile["branding"];
}) => {
  if (!organizationId || !branding) return;

  queryClient.setQueryData<OrganizationProfile | undefined>(
    organizationSettingsKeys.organization(),
    (current) =>
      current
        ? {
            ...current,
            branding,
          }
        : current,
  );

  queryClient.setQueryData(["tenant-branding", organizationId], branding);
};

export const useOrganizationProfile = () =>
  useQuery({
    queryKey: organizationSettingsKeys.organization(),
    queryFn: async () => {
      const res = await settingsService.getOrganization();
      const organization = organizationProfileSchema.parse(res.data);
      persistAndApplyTenantBranding(organization.id, organization.branding);
      return organization;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useOrganizationModules = () =>
  useQuery({
    queryKey: organizationSettingsKeys.modules(),
    queryFn: async () => {
      const res = await settingsService.listModules();
      const modules = organizationModuleSchema.array().parse(res.data);
      syncEnabledModulesInSession(modules);
      return modules;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useOrganizationScreens = () =>
  useQuery({
    queryKey: organizationSettingsKeys.screens(),
    queryFn: async () => {
      const res = await settingsService.listScreens();
      return organizationScreenSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

export const useOrganizationPreferences = (namespace?: string) =>
  useQuery({
    queryKey: organizationSettingsKeys.preferences(namespace),
    queryFn: async () => {
      const res = await settingsService.listPreferences(namespace);
      return organizationSettingSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateOrganizationProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationProfile) =>
      settingsService.updateOrganization(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.organization(),
      });
      toast.success("Perfil de empresa actualizado.");
    },
    onError: () => {
      toast.error("No pudimos actualizar el perfil de empresa.");
    },
  });
};

export const useUpdateOrganizationBranding = () => {
  const queryClient = useQueryClient();
  const { activeMembership } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateOrganizationBranding) =>
      settingsService.updateBranding(data),
    onSuccess: async (res) => {
      syncBrandingInCache({
        queryClient,
        organizationId: activeMembership?.organization.id,
        branding: res.data,
      });
      persistAndApplyTenantBranding(
        activeMembership?.organization.id,
        res.data,
      );
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.organization(),
      });
      toast.success("Branding actualizado.");
    },
    onError: () => {
      toast.error("No pudimos actualizar el branding.");
    },
  });
};

export const useUploadBrandingLogo = () => {
  const queryClient = useQueryClient();
  const { activeMembership } = useAuth();

  return useMutation({
    mutationFn: (file: File) => settingsService.uploadBrandingLogo(file),
    onSuccess: async (res) => {
      storeBrandAssetVersion(activeMembership?.organization.id, "logo");
      syncBrandingInCache({
        queryClient,
        organizationId: activeMembership?.organization.id,
        branding: res.data,
      });
      persistAndApplyTenantBranding(activeMembership?.organization.id, res.data);
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.organization(),
      });
      toast.success("Logo actualizado.");
    },
    onError: () => {
      toast.error("No pudimos subir el logo.");
    },
  });
};

export const useUploadBrandingIcon = () => {
  const queryClient = useQueryClient();
  const { activeMembership } = useAuth();

  return useMutation({
    mutationFn: (file: File) => settingsService.uploadBrandingIcon(file),
    onSuccess: async (res) => {
      storeBrandAssetVersion(activeMembership?.organization.id, "icon");
      syncBrandingInCache({
        queryClient,
        organizationId: activeMembership?.organization.id,
        branding: res.data,
      });
      persistAndApplyTenantBranding(activeMembership?.organization.id, res.data);
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.organization(),
      });
      toast.success("Icono actualizado.");
    },
    onError: () => {
      toast.error("No pudimos subir el icono.");
    },
  });
};

export const useUpdateOrganizationModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleKey,
      data,
    }: {
      moduleKey: string;
      data: UpdateOrganizationModule;
    }) => settingsService.updateModule(moduleKey, data),
    onSuccess: async (res) => {
      queryClient.setQueryData<OrganizationModule[] | undefined>(
        organizationSettingsKeys.modules(),
        (current) => {
          if (!current?.length) {
            return current;
          }

          const nextModules = current.map((item) =>
            item.module.key === res.data.module.key ? res.data : item,
          );

          syncEnabledModulesInSession(nextModules);
          return nextModules;
        },
      );
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.modules(),
      });
      toast.success("Modulo actualizado.");
    },
    onError: () => {
      toast.error("No pudimos actualizar el modulo.");
    },
  });
};

export const useCreateOrganizationScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationScreen) =>
      settingsService.createScreen(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.screens(),
      });
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Pantalla creada.");
    },
    onError: () => {
      toast.error("No pudimos crear la pantalla.");
    },
  });
};

export const useUpdateOrganizationScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      screenId,
      data,
    }: {
      screenId: string;
      data: UpdateOrganizationScreen;
    }) => settingsService.updateScreen(screenId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.screens(),
      });
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Pantalla actualizada.");
    },
    onError: () => {
      toast.error("No pudimos actualizar la pantalla.");
    },
  });
};

export const useDeleteOrganizationScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (screenId: string) => settingsService.deleteScreen(screenId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.screens(),
      });
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all });
      toast.success("Pantalla eliminada.");
    },
    onError: () => {
      toast.error("No pudimos eliminar la pantalla.");
    },
  });
};

export const useUpsertOrganizationPreferences = (namespace?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: OrganizationSettingInput[]) =>
      settingsService.upsertPreferences(settings),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys.preferences(namespace),
      });
      toast.success("Preferencias actualizadas.");
    },
    onError: () => {
      toast.error("No pudimos actualizar las preferencias.");
    },
  });
};
