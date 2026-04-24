import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth";
import { settingsService } from "../services/settings.service";
import { organizationProfileSchema } from "../schemas/settings.schema";
import {
  applyTenantBranding,
  getStoredTenantBranding,
  persistAndApplyTenantBranding,
} from "../utils/tenant-branding";

export const useTenantBranding = () => {
  const { activeMembership, permissions, enabledModules } = useAuth();
  const organizationId = activeMembership?.organization.id;
  const canReadSettings =
    Boolean(organizationId) &&
    enabledModules.includes("settings") &&
    permissions.includes("settings.read");

  useEffect(() => {
    applyTenantBranding(getStoredTenantBranding(organizationId), organizationId);
  }, [organizationId]);

  return useQuery({
    queryKey: ["tenant-branding", organizationId],
    enabled: canReadSettings,
    queryFn: async () => {
      const res = await settingsService.getOrganization();
      const organization = organizationProfileSchema.parse(res.data);
      persistAndApplyTenantBranding(organization.id, organization.branding);
      return organization.branding;
    },
    staleTime: 1000 * 60 * 10,
  });
};
