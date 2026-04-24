import * as React from "react";
import { Building2 } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import {
  getStoredBrandAssetVersion,
  getStoredTenantBranding,
  resolveBrandAssetUrl,
} from "@/modules/settings/utils/tenant-branding";
import { useSidebarNav } from "@/shared/hooks/useSidebarNav";
import { useAuthStore } from "@/shared/store/auth.store";
import { Link } from "react-router-dom";
import { useAccessContext } from "@/shared/hooks/useAccessContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = useSidebarNav();
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const { isCustomerPortal } = useAccessContext();
  const brandingQuery = useTenantBranding();
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const logoUrl = resolveBrandAssetUrl(
    branding?.logoUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "logo"),
  );
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );
  const organizationName = activeMembership?.organization.name ?? "Organizacion";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-4">
        <Link
          to="/app"
          className="rounded-[1.35rem] border border-sidebar-border/80 bg-white/88 p-3 shadow-sm transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sidebar-border/70 bg-muted/40">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={organizationName}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2 className="size-5 text-primary" />
              )}
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {isCustomerPortal ? "Portal cliente" : "Tenant activo"}
              </p>
              <p className="truncate text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                {organizationName}
              </p>
            </div>
          </div>

          {logoUrl ? (
            <div className="mt-3 flex h-11 items-center justify-center rounded-xl border border-sidebar-border/60 bg-muted/20 px-3">
              <img
                src={logoUrl}
                alt={organizationName}
                className="h-full w-full object-contain object-center"
              />
            </div>
          ) : null}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-4 py-4">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
