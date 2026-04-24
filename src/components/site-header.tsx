import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import {
  getStoredBrandAssetVersion,
  getStoredTenantBranding,
  resolveBrandAssetUrl,
} from "@/modules/settings/utils/tenant-branding";
import { Breadcrumbs } from "./breadcrumbs";
import { useAuthStore } from "@/shared/store/auth.store";

export function SiteHeader() {
  const { activeMembership } = useAuthStore();
  const brandingQuery = useTenantBranding();
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumbs />

        <div className="ml-auto hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">Organizacion activa</p>
          <div className="mt-1 flex items-center justify-end gap-3">
            {iconUrl ? (
              <span className="grid size-9 place-items-center overflow-hidden rounded-2xl border bg-white/80">
                <img
                  src={iconUrl}
                  alt={activeMembership?.organization.name ?? "Tenant"}
                  className="h-full w-full object-contain p-1"
                />
              </span>
            ) : null}
            <p className="text-sm font-semibold">
              {activeMembership?.organization.name ?? "Sin tenant"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
