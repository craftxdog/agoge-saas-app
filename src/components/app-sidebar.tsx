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
import { formatSystemLabel } from "@/shared/utils/labels";
import { Link } from "react-router-dom";
import { useAccessContext } from "@/shared/hooks/useAccessContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = useSidebarNav();
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const { isCustomerPortal } = useAccessContext();
  const brandingQuery = useTenantBranding();
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );
  const organizationName = activeMembership?.organization.name ?? "Organizacion";
  const roleLabel =
    activeMembership?.roles.length
      ? activeMembership.roles.map((role) => formatSystemLabel(role)).join(" · ")
      : "Sin rol activo";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-3">
        <Link
          to="/app"
          className="rounded-[1.1rem] border border-sidebar-border/75 bg-white/84 px-3 py-2.5 shadow-sm transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/40">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {isCustomerPortal ? "Portal de cliente" : "Organizacion activa"}
              </p>
              <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                {organizationName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {roleLabel}
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-3">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
