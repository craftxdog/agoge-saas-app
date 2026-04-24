import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = useSidebarNav();
  const activeMembership = useAuthStore((state) => state.activeMembership);
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
  const organizationName = activeMembership?.organization.name ?? "Agoge Academy";
  const organizationInitial = organizationName.charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-3 pt-3 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
            >
              <Link
                to="/app"
                className="group relative overflow-hidden rounded-[1.9rem] border border-sidebar-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,236,224,0.9))] p-4 shadow-[0_18px_50px_rgba(76,98,86,0.12)]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-20 rounded-b-full bg-[radial-gradient(circle_at_top,rgba(79,143,131,0.18),transparent_72%)]" />
                <div className="relative flex items-center justify-between gap-2">
                  <Badge className="rounded-full bg-sidebar-primary/12 px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Tenant activo
                  </Badge>
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    SaaS
                  </span>
                </div>

                <div className="relative mt-4 rounded-[1.5rem] border border-sidebar-border/70 bg-white/80 p-3 shadow-inner">
                  <div className="flex h-16 items-center justify-center rounded-[1.1rem] bg-[radial-gradient(circle_at_center,rgba(79,143,131,0.14),rgba(255,255,255,0.96)_62%)]">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={organizationName}
                        className="h-full w-full object-contain object-center"
                      />
                    ) : (
                      <span className="font-display text-2xl font-semibold tracking-tight text-sidebar-foreground">
                        {organizationName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative mt-4 flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white/90 shadow-sm">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={organizationName}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <span className="text-base font-semibold text-primary">
                        {organizationInitial}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold tracking-tight text-sidebar-foreground">
                      {organizationName}
                    </p>
                    <p className="truncate text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Experiencia operativa
                    </p>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-2">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="px-3 pt-2 pb-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
